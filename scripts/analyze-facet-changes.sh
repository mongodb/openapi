#!/usr/bin/env bash
#
# analyze-facet-changes.sh
#
# Detects modifications and removals of existing validation facets
# (pattern, minLength, maxLength, minimum, maximum, enum) in openapi/v2.yaml
# by walking consecutive git commits and analyzing unified diffs.
#
# Pure additions (new schemas/properties) are excluded -- only changes to
# already-existing facets are reported.
#
# Outputs one CSV per facet under scripts/output/.
#
# Usage:
#   cd <repo-root>
#   bash scripts/analyze-facet-changes.sh [--since YYYY-MM-DD]
#
# Options:
#   --since DATE   Only analyze commits after this date (default: 12 months ago)
#
# Expected runtime: ~15-25 minutes for 12 months of history.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SPEC_FILE="openapi/v2.yaml"
OUTPUT_DIR="$REPO_ROOT/scripts/output"

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

echo "=== Facet Change Analyzer ==="
echo "Spec file:  $SPEC_FILE"
echo "Since:      $SINCE_DATE"
echo "Output dir: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Initialize CSV files with headers
for facet in pattern minLength maxLength minimum maximum enum; do
    echo "commit,date,change_type,parent_schema,property_context,old_value,new_value,actions_url" > "$OUTPUT_DIR/${facet}.csv"
done

# Get the list of commits (oldest first) that touched the spec file since the given date
COMMITS_FILE="$(mktemp)"
git log --format="%H" --reverse --since="$SINCE_DATE" -- "$SPEC_FILE" > "$COMMITS_FILE"
TOTAL=$(wc -l < "$COMMITS_FILE" | tr -d ' ')

echo "Found $TOTAL commits since $SINCE_DATE"
echo ""

if [ "$TOTAL" -lt 2 ]; then
    echo "Need at least 2 commits to compare. Exiting."
    rm -f "$COMMITS_FILE"
    exit 0
fi

PAIR_COUNT=$((TOTAL - 1))
CURRENT=0
PREV_COMMIT=""

while IFS= read -r COMMIT_B; do
    if [ -z "$PREV_COMMIT" ]; then
        PREV_COMMIT="$COMMIT_B"
        continue
    fi

    COMMIT_A="$PREV_COMMIT"
    PREV_COMMIT="$COMMIT_B"
    CURRENT=$((CURRENT + 1))

    COMMIT_SHORT="$(echo "$COMMIT_B" | cut -c1-12)"
    COMMIT_DATE="$(git log -1 --format='%as' "$COMMIT_B")"
    COMMIT_MSG="$(git log -1 --format='%s' "$COMMIT_B")"

    # Extract actions URL from commit message if present
    ACTIONS_URL=""
    case "$COMMIT_MSG" in
        *https://github.com/*)
            ACTIONS_URL="$(echo "$COMMIT_MSG" | sed -n 's/.*\(https:\/\/github\.com\/[^ ]*\).*/\1/p')"
            # Remove trailing period if present
            ACTIONS_URL="${ACTIONS_URL%.}"
            ;;
    esac

    # Progress indicator
    PROGRESS=$((CURRENT * 100 / PAIR_COUNT))
    printf "\r[%3d%%] Processing commit %d/%d: %s (%s)" "$PROGRESS" "$CURRENT" "$PAIR_COUNT" "$COMMIT_SHORT" "$COMMIT_DATE"

    # Generate the unified diff for this commit pair (with extra context for schema detection)
    DIFF_OUTPUT="$(git diff -U80 "$COMMIT_A..$COMMIT_B" -- "$SPEC_FILE" 2>/dev/null)" || continue

    if [ -z "$DIFF_OUTPUT" ]; then
        continue
    fi

    # Process the diff with awk: parse hunks and detect facet modifications/removals
    echo "$DIFF_OUTPUT" | awk -v commit="$COMMIT_SHORT" \
                               -v date="$COMMIT_DATE" \
                               -v actions_url="$ACTIONS_URL" \
                               -v output_dir="$OUTPUT_DIR" \
    '
    function csv_escape(s) {
        gsub(/"/, "\"\"", s)
        if (index(s, ",") > 0 || index(s, "\"") > 0 || index(s, "\n") > 0) {
            return "\"" s "\""
        }
        return s
    }

    function extract_property(line,    s, key) {
        s = line
        sub(/^[+-]/, "", s)
        gsub(/^[[:space:]]+/, "", s)
        gsub(/[[:space:]]+$/, "", s)
        if (match(s, /^[a-zA-Z_][a-zA-Z0-9_]*:/)) {
            key = substr(s, RSTART, RLENGTH - 1)
            return key
        }
        return ""
    }

    function get_facet(line,    s) {
        s = line
        sub(/^[+-]/, "", s)
        gsub(/^[[:space:]]+/, "", s)
        if (s ~ /^pattern:/)   return "pattern"
        if (s ~ /^minLength:/) return "minLength"
        if (s ~ /^maxLength:/) return "maxLength"
        if (s ~ /^minimum:/)   return "minimum"
        if (s ~ /^maximum:/)   return "maximum"
        if (s ~ /^enum:/)      return "enum"
        return ""
    }

    function get_value(line,    s) {
        s = line
        sub(/^[+-]/, "", s)
        gsub(/^[[:space:]]+/, "", s)
        sub(/^[a-zA-Z_][a-zA-Z0-9_]*:[[:space:]]*/, "", s)
        gsub(/^[[:space:]]+/, "", s)
        gsub(/[[:space:]]+$/, "", s)
        return s
    }

    # Extract a schema name from a line.
    # Schemas in components.schemas are capitalized keys at 8-space indent, e.g.:
    #   "        ConnectedOrgConfig:"
    # In the diff, the line has a leading diff marker (+/-/space).
    function extract_schema(line,    s, key) {
        s = line
        # Strip leading diff marker: +, -, or space (context line)
        sub(/^[-+ ]/, "", s)
        # Match schema names at exactly 8 spaces indent (top-level components.schemas)
        if (match(s, /^        [A-Z][a-zA-Z0-9_]*:/)) {
            key = substr(s, RSTART + 8, RLENGTH - 9)
            return key
        }
        return ""
    }

    # Extract a path-level operation context from a line.
    # In the paths section, operations look like "    /api/atlas/v2/groups/..." at 8-space indent.
    # The hunk header often contains the path, e.g.: "@@ -100,20 +100,20 @@ /api/atlas/v2/..."
    function extract_path_context(line,    s) {
        s = line
        if (match(s, /\/api\/atlas\/v2[^ ]*/)) {
            return substr(s, RSTART, RLENGTH)
        }
        return ""
    }

    function write_result(facet, change_type, schema, context, old_val, new_val) {
        file = output_dir "/" facet ".csv"
        printf "%s,%s,%s,%s,%s,%s,%s,%s\n", \
            csv_escape(commit), \
            csv_escape(date), \
            csv_escape(change_type), \
            csv_escape(schema), \
            csv_escape(context), \
            csv_escape(old_val), \
            csv_escape(new_val), \
            csv_escape(actions_url) >> file
    }

    function is_meta_property(p) {
        return (p == "type" || p == "format" || p == "description" || \
                p == "example" || p == "readOnly" || p == "writeOnly" || \
                p == "default" || p == "required" || p == "nullable" || \
                p == "deprecated" || p == "items" || p == "properties" || \
                p == "pattern" || p == "minLength" || p == "maxLength" || \
                p == "minimum" || p == "maximum" || p == "enum" || \
                p == "title" || p == "allOf" || p == "oneOf" || p == "anyOf" || \
                p == "not" || p == "additionalProperties" || p == "exclusiveMinimum" || \
                p == "exclusiveMaximum" || p == "uniqueItems" || p == "minItems" || \
                p == "maxItems")
    }

    function process_hunk(    r, facet, old_val, context, schema, c, prop, sc, found_match, new_val, a, afacet, eline, e, schema_is_removed, context_is_removed) {
        for (r = 1; r <= hunk_line_count; r++) {
            if (hunk_types[r] != "removed") continue

            facet = get_facet(hunk_lines[r])
            if (facet == "") continue

            old_val = get_value(hunk_lines[r])

            # For enum, collect subsequent removed list items (lines starting with "- ")
            if (facet == "enum") {
                for (e = r + 1; e <= hunk_line_count; e++) {
                    if (hunk_types[e] != "removed") break
                    eline = hunk_lines[e]
                    sub(/^-/, "", eline)
                    gsub(/^[[:space:]]+/, "", eline)
                    if (eline ~ /^- /) {
                        old_val = old_val " | " eline
                    } else {
                        break
                    }
                }
            }

            # Find parent schema: look backward for the nearest schema-level name
            # (capitalized key at 8-space indent, which is a components.schemas child)
            # Also check the hunk header schema if stored
            schema = hunk_header_schema
            schema_is_removed = 0
            for (sc = r - 1; sc >= 1; sc--) {
                s_name = extract_schema(hunk_lines[sc])
                if (s_name != "") {
                    schema = s_name
                    if (hunk_types[sc] == "removed") {
                        schema_is_removed = 1
                    }
                    break
                }
            }

            # Skip if the entire parent schema is being deleted
            if (schema_is_removed) continue

            # Find context: look backward for the nearest meaningful property name
            context = ""
            context_is_removed = 0
            for (c = r - 1; c >= 1; c--) {
                prop = extract_property(hunk_lines[c])
                if (prop != "" && !is_meta_property(prop)) {
                    context = prop
                    if (hunk_types[c] == "removed") {
                        context_is_removed = 1
                    }
                    break
                }
            }
            if (context == "") {
                for (c = r - 1; c >= 1; c--) {
                    prop = extract_property(hunk_lines[c])
                    if (prop != "" && prop != facet) {
                        context = prop
                        if (hunk_types[c] == "removed") {
                            context_is_removed = 1
                        }
                        break
                    }
                }
            }

            # Skip if the parent property is being deleted
            if (context_is_removed) continue

            # Look for a corresponding added line with the same facet AND same
            # property context in this hunk. This prevents false positives when
            # multiple properties with the same facet are shuffled in a hunk.
            found_match = 0
            new_val = ""
            for (a = 1; a <= hunk_line_count; a++) {
                if (hunk_types[a] != "added") continue
                afacet = get_facet(hunk_lines[a])
                if (afacet != facet) continue

                # Find property context for this added line
                a_context = ""
                for (ac = a - 1; ac >= 1; ac--) {
                    a_prop = extract_property(hunk_lines[ac])
                    if (a_prop != "" && !is_meta_property(a_prop)) {
                        a_context = a_prop
                        break
                    }
                }
                if (a_context == "") {
                    for (ac = a - 1; ac >= 1; ac--) {
                        a_prop = extract_property(hunk_lines[ac])
                        if (a_prop != "" && a_prop != facet) {
                            a_context = a_prop
                            break
                        }
                    }
                }

                # Only match if the property context is the same
                if (a_context != context) continue

                found_match = 1
                new_val = get_value(hunk_lines[a])

                if (facet == "enum") {
                    for (e = a + 1; e <= hunk_line_count; e++) {
                        if (hunk_types[e] != "added") break
                        eline = hunk_lines[e]
                        sub(/^\+/, "", eline)
                        gsub(/^[[:space:]]+/, "", eline)
                        if (eline ~ /^- /) {
                            new_val = new_val " | " eline
                        } else {
                            break
                        }
                    }
                }
                break
            }

            if (found_match) {
                if (old_val != new_val) {
                    write_result(facet, "modified", schema, context, old_val, new_val)
                }
            } else {
                write_result(facet, "removed", schema, context, old_val, "")
            }
        }
    }

    BEGIN {
        in_hunk = 0
        hunk_line_count = 0
        removed_count = 0
        hunk_header_schema = ""
    }

    /^@@/ {
        if (in_hunk && removed_count > 0) {
            process_hunk()
        }
        in_hunk = 1
        hunk_line_count = 0
        removed_count = 0
        hunk_header_schema = ""

        # Try to extract path context from the @@ header (e.g., "@@ ... @@ /api/atlas/v2/...")
        path_ctx = extract_path_context($0)
        if (path_ctx != "") {
            hunk_header_schema = path_ctx
        }
        next
    }

    in_hunk && /^[-+ ]/ {
        hunk_line_count++
        hunk_lines[hunk_line_count] = $0

        if (/^-[^-]/) {
            hunk_types[hunk_line_count] = "removed"
            removed_count++
        } else if (/^\+[^+]/) {
            hunk_types[hunk_line_count] = "added"
        } else {
            hunk_types[hunk_line_count] = "context"
        }

        # Track the most recent schema name seen in the hunk (for use as fallback)
        s_check = extract_schema($0)
        if (s_check != "") {
            hunk_header_schema = s_check
        }
        next
    }

    in_hunk && !/^[-+ @]/ {
        if (removed_count > 0) {
            process_hunk()
        }
        in_hunk = 0
        hunk_line_count = 0
        removed_count = 0
    }

    END {
        if (in_hunk && removed_count > 0) {
            process_hunk()
        }
    }
    '

done < "$COMMITS_FILE"

rm -f "$COMMITS_FILE"

echo ""
echo ""
echo "=== Results ==="
echo ""

# Print summary
TOTAL_CHANGES=0
for facet in pattern minLength maxLength minimum maximum enum; do
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
