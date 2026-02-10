#!/usr/bin/env bash
#
# analyze-facet-changes-v2.sh
#
# Detects modifications and removals of existing validation facets
# (pattern, minLength, maxLength, minimum, maximum, minItems, maxItems, enum)
# in openapi/v2.yaml
# by parsing the full YAML at each commit and comparing facet snapshots.
#
# Unlike v1 (which parses unified diffs with heuristics), this version
# extracts a complete facet map per commit using yq + jq, making the
# analysis fully deterministic and eliminating false positives from
# diff-context misattribution.
#
# Pure additions (new schemas/properties) are excluded — only changes to
# already-existing facets are reported.
#
# Outputs one CSV per facet under scripts/output/.
#
# Usage:
#   cd <repo-root>
#   bash scripts/analyze-facet-changes-v2.sh [--since YYYY-MM-DD]
#
# Options:
#   --since DATE   Only analyze commits after this date (default: 12 months ago)
#
# Requirements: yq (Mike Farah's Go version, v4+), jq
#
# Expected runtime: ~15-25 minutes for 12 months of history.

set -euo pipefail

# ─── Dependency check ─────────────────────────────────────────────────
for cmd in yq jq; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "Error: '$cmd' is required but not installed." >&2
        echo "Install with: brew install $cmd" >&2
        exit 1
    fi
done

REPO_ROOT="$(git rev-parse --show-toplevel)"
SPEC_FILE="openapi/v2.yaml"
OUTPUT_DIR="$REPO_ROOT/scripts/output"
FACETS="pattern minLength maxLength minimum maximum minItems maxItems enum"

# Default: 12 months ago
SINCE_DATE="$(date -v-12m '+%Y-%m-%d' 2>/dev/null || date -d '12 months ago' '+%Y-%m-%d' 2>/dev/null)"

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --since)
            SINCE_DATE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

echo "=== Facet Change Analyzer v2 (snapshot-based) ==="
echo "Spec file:  $SPEC_FILE"
echo "Since:      $SINCE_DATE"
echo "Output dir: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

# Initialize CSV files with headers
for facet in $FACETS; do
    echo "commit,date,change_type,parent_schema,property_context,old_value,new_value,actions_url" \
        > "$OUTPUT_DIR/${facet}.csv"
done

# Temp directory for intermediate files (cleaned up on exit)
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# ─── jq: extract facet path/value pairs ──────────────────────────────
#
# Input:  JSON object  (.components.schemas)
# Output: sorted TSV — path<TAB>facet<TAB>value
#
#   path  = JSON path from the schema root to the facet's parent,
#           e.g. "GroupMaintenanceWindow/properties/hourOfDay"
#   facet = one of: pattern minLength maxLength minimum maximum enum
#   value = canonical string (scalars as-is; enum arrays sorted & joined)
#
read -r -d '' JQ_FACETS <<'JQEOF' || true
. as $root |
[
  ( paths(type == "number" or type == "string")
    | select(.[-1] | IN("pattern","minLength","maxLength","minimum","maximum","minItems","maxItems")) ),
  ( paths(type == "array")
    | select(.[-1] == "enum") )
] |
map(. as $p | {
  path:  ($p[0:-1] | map(tostring) | join("/")),
  facet: $p[-1],
  value: (
    $root | getpath($p) |
    if type == "array" then sort | map(tostring) | join(" | ")
    else tostring end
  )
}) |
sort_by("\(.path)/\(.facet)") |
.[] |
"\(.path)\t\(.facet)\t\(.value)"
JQEOF

# ─── jq: extract property paths ──────────────────────────────────────
#
# Returns every path that represents a schema property definition
# (a direct child of a key named "properties" at any nesting depth).
# Used to distinguish "facet removed" from "entire property deleted".
#
read -r -d '' JQ_PROPS <<'JQEOF' || true
[
  paths(objects) |
  select(length >= 2 and .[-2] == "properties")
] |
map(map(tostring) | join("/")) |
unique[]
JQEOF

# ─── extract_snapshot ────────────────────────────────────────────────
#
# Extracts facet data for a single commit.
#
# Args:   $1 = full commit hash
#         $2 = output file prefix
# Produces:
#   ${prefix}.facets.tsv  — facet entries (path, facet, value)
#   ${prefix}.schemas.txt — schema names
#   ${prefix}.props.txt   — property paths
#
extract_snapshot() {
    local commit="$1"
    local prefix="$2"
    local json_file="${prefix}.json"

    # Convert the schemas section from YAML to JSON (single yq parse)
    if ! git show "$commit:$SPEC_FILE" 2>/dev/null \
         | yq -o=json '.components.schemas' > "$json_file" 2>/dev/null; then
        # Extraction failed — produce empty files so comparison still works
        : > "${prefix}.facets.tsv"
        : > "${prefix}.schemas.txt"
        : > "${prefix}.props.txt"
        rm -f "$json_file"
        return
    fi

    # Extract facet map
    jq -r "$JQ_FACETS" < "$json_file" | sort > "${prefix}.facets.tsv"

    # Extract schema names
    jq -r 'keys[]' < "$json_file" | sort > "${prefix}.schemas.txt"

    # Extract property paths
    jq -r "$JQ_PROPS" < "$json_file" | sort -u > "${prefix}.props.txt"

    rm -f "$json_file"
}

# ─── compare_snapshots ───────────────────────────────────────────────
#
# Compares facet snapshots of two consecutive commits and appends
# any modifications or removals to the per-facet CSV files.
#
# Args:   $1 = prefix for commit A (previous)
#         $2 = prefix for commit B (current)
#         $3 = short commit hash of B
#         $4 = commit date of B
#         $5 = actions URL (may be empty)
#
compare_snapshots() {
    local prefix_a="$1"
    local prefix_b="$2"
    local commit="$3"
    local cdate="$4"
    local actions_url="$5"

    local facets_a="${prefix_a}.facets.tsv"
    local facets_b="${prefix_b}.facets.tsv"
    local schemas_b="${prefix_b}.schemas.txt"
    local props_b="${prefix_b}.props.txt"

    # Nothing to compare if the previous commit had no facets
    [ -s "$facets_a" ] || return 0

    awk -F'\t' \
        -v commit="$commit" \
        -v cdate="$cdate" \
        -v actions_url="$actions_url" \
        -v output_dir="$OUTPUT_DIR" \
        -v schemas_file="$schemas_b" \
        -v props_file="$props_b" \
    '
    function csv_escape(s) {
        gsub(/"/, "\"\"", s)
        if (index(s, ",") > 0 || index(s, "\"") > 0 || index(s, "\n") > 0)
            return "\"" s "\""
        return s
    }

    # Given a facet parent path such as
    #   "Schema/allOf/0/properties/name/items"
    # find the deepest "properties/<name>" ancestor path to check for
    # property-level deletion.  Returns the input path unchanged if no
    # "properties" segment is found (facet lives directly on the schema).
    function nearest_property_path(path,    n, parts, i, last_idx, j, result) {
        n = split(path, parts, "/")
        last_idx = 0
        for (i = 1; i <= n; i++) {
            if (parts[i] == "properties" && i + 1 <= n)
                last_idx = i
        }
        if (last_idx == 0) return path
        result = parts[1]
        for (j = 2; j <= last_idx + 1; j++)
            result = result "/" parts[j]
        return result
    }

    # Extract a human-readable property context from the path.
    # Skips structural keys (properties, items, allOf, …) and numeric
    # array indices, keeping the last meaningful property name.
    function property_context(path,    n, parts, i, ctx) {
        n = split(path, parts, "/")
        ctx = ""
        for (i = 2; i <= n; i++) {
            if (parts[i] == "properties"    || parts[i] == "items" || \
                parts[i] == "allOf"         || parts[i] == "oneOf" || \
                parts[i] == "anyOf"         || parts[i] == "not"   || \
                parts[i] == "additionalProperties" || \
                parts[i] ~ /^[0-9]+$/) continue
            ctx = parts[i]
        }
        return ctx
    }

    BEGIN {
        # Load schema names for commit B
        while ((getline line < schemas_file) > 0)
            schema_exists[line] = 1
        close(schemas_file)

        # Load property paths for commit B
        while ((getline line < props_file) > 0)
            prop_exists[line] = 1
        close(props_file)
    }

    # ── First file (facets_b): load commit B facets into memory ──────
    NR == FNR {
        facets_b[$1, $2] = $3
        seen_b[$1, $2] = 1
        next
    }

    # ── Second file (facets_a): compare commit A against B ───────────
    {
        path = $1; facet = $2; old_val = $3

        # Schema name is the first path component
        split(path, _seg, "/")
        schema = _seg[1]

        # Skip if the entire schema was deleted in B
        if (!(schema in schema_exists)) next

        # Skip if the property itself was deleted in B.
        # Only applies when the path contains a "properties" segment
        # (schema-level facets have no property ancestor to check).
        pp = nearest_property_path(path)
        if (index(path, "/properties/") > 0 && !(pp in prop_exists)) next

        key = path SUBSEP facet
        if (key in seen_b) {
            # Facet exists in both — check if value changed
            new_val = facets_b[path, facet]
            if (new_val != old_val) {
                ctx = property_context(path)
                file = output_dir "/" facet ".csv"
                printf "%s,%s,%s,%s,%s,%s,%s,%s\n", \
                    csv_escape(commit), csv_escape(cdate), \
                    csv_escape("modified"), csv_escape(schema), \
                    csv_escape(ctx), csv_escape(old_val), \
                    csv_escape(new_val), csv_escape(actions_url) >> file
            }
        } else {
            # Facet was removed
            ctx = property_context(path)
            file = output_dir "/" facet ".csv"
            printf "%s,%s,%s,%s,%s,%s,%s,%s\n", \
                csv_escape(commit), csv_escape(cdate), \
                csv_escape("removed"), csv_escape(schema), \
                csv_escape(ctx), csv_escape(old_val), \
                csv_escape(""), csv_escape(actions_url) >> file
        }
    }
    ' "$facets_b" "$facets_a"
}

# ─── Main loop ────────────────────────────────────────────────────────

# Collect commits that touched the spec file (oldest first)
COMMITS_FILE="$WORK_DIR/commits.txt"
git log --format="%H" --reverse --since="$SINCE_DATE" -- "$SPEC_FILE" \
    > "$COMMITS_FILE"
TOTAL=$(wc -l < "$COMMITS_FILE" | tr -d ' ')

echo "Found $TOTAL commits since $SINCE_DATE"
echo ""

if [ "$TOTAL" -lt 2 ]; then
    echo "Need at least 2 commits to compare. Exiting."
    exit 0
fi

PAIR_COUNT=$((TOTAL - 1))
CURRENT=0
PREV_COMMIT=""
PREV_PREFIX=""

while IFS= read -r COMMIT_B; do
    if [ -z "$PREV_COMMIT" ]; then
        PREV_COMMIT="$COMMIT_B"
        PREV_PREFIX="$WORK_DIR/snap_prev"
        printf "\rExtracting initial snapshot..."
        extract_snapshot "$PREV_COMMIT" "$PREV_PREFIX"
        continue
    fi

    CURRENT=$((CURRENT + 1))

    COMMIT_SHORT="$(echo "$COMMIT_B" | cut -c1-12)"
    COMMIT_DATE="$(git log -1 --format='%as' "$COMMIT_B")"
    COMMIT_MSG="$(git log -1 --format='%s' "$COMMIT_B")"

    # Extract GitHub Actions URL from commit message if present
    ACTIONS_URL=""
    case "$COMMIT_MSG" in
        *https://github.com/*)
            ACTIONS_URL="$(echo "$COMMIT_MSG" | \
                sed -n 's/.*\(https:\/\/github\.com\/[^ ]*\).*/\1/p')"
            ACTIONS_URL="${ACTIONS_URL%.}"
            ;;
    esac

    PROGRESS=$((CURRENT * 100 / PAIR_COUNT))
    printf "\r[%3d%%] Processing commit %d/%d: %s (%s)   " \
        "$PROGRESS" "$CURRENT" "$PAIR_COUNT" "$COMMIT_SHORT" "$COMMIT_DATE"

    # Extract snapshot for commit B
    CURR_PREFIX="$WORK_DIR/snap_curr"
    extract_snapshot "$COMMIT_B" "$CURR_PREFIX"

    # Compare: what changed from prev → current?
    compare_snapshots "$PREV_PREFIX" "$CURR_PREFIX" \
        "$COMMIT_SHORT" "$COMMIT_DATE" "$ACTIONS_URL"

    # Rotate: current snapshot becomes previous for the next iteration
    for ext in facets.tsv schemas.txt props.txt; do
        mv "$CURR_PREFIX.$ext" "$PREV_PREFIX.$ext"
    done

    PREV_COMMIT="$COMMIT_B"
done < "$COMMITS_FILE"

echo ""
echo ""
echo "=== Results ==="
echo ""

# Print summary
TOTAL_CHANGES=0
for facet in $FACETS; do
    CSV_FILE="$OUTPUT_DIR/${facet}.csv"
    ROW_COUNT=$(( $(wc -l < "$CSV_FILE" | tr -d ' ') - 1 ))
    if [ "$ROW_COUNT" -gt 0 ]; then
        MODIFIED=$(grep -c ',modified,' "$CSV_FILE" 2>/dev/null || true)
        MODIFIED=$(echo "$MODIFIED" | tr -d '[:space:]')
        REMOVED=$(grep -c ',removed,' "$CSV_FILE" 2>/dev/null || true)
        REMOVED=$(echo "$REMOVED" | tr -d '[:space:]')
        echo "  ${facet}: ${ROW_COUNT} changes (${MODIFIED} modified, ${REMOVED} removed) -> ${CSV_FILE}"
        TOTAL_CHANGES=$((TOTAL_CHANGES + ROW_COUNT))
    else
        echo "  ${facet}: 0 changes -> ${CSV_FILE}"
    fi
done

echo ""
echo "Total facet modifications/removals found: $TOTAL_CHANGES"
echo "Output files are in: $OUTPUT_DIR/"
