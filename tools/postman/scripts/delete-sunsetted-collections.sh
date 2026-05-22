#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Delete Postman collections for sunsetted API versions.
# A collection is deleted when its version date is NOT in versions.json.
#
# Environment variables:
#   POSTMAN_API_KEY     - API Key for Postman API
#   WORKSPACE_ID        - Identifier for the Postman Workspace
#   FULL_OPENAPI_FOLDER - Path to openapi/v2/ directory (default: ../../openapi/v2/)
#   TMP_FOLDER          - Folder for temporary files (default: ../tmp)
#########################################################

FULL_OPENAPI_FOLDER=${FULL_OPENAPI_FOLDER:-"../../openapi/v2/"}
TMP_FOLDER=${TMP_FOLDER:-"../tmp"}
COLLECTIONS_LIST_FILE="${TMP_FOLDER}/collections-list-cleanup.json"
VERSIONS_JSON="${FULL_OPENAPI_FOLDER}versions.json"

execute_curl() {
  local args=("$@")
  if [[ "${RUNNER_DEBUG:-0}" == "1" ]]; then
    args+=("-v")
    echo "Debug mode enabled - using verbose curl output"
  fi
  curl "${args[@]}" 2>&1 | grep -i -v "api-key\|x-api-key\|PMAK-" || true
}

if [[ ! -f "${VERSIONS_JSON}" ]]; then
  echo "ERROR: versions.json not found at ${VERSIONS_JSON}"
  exit 1
fi

echo "Fetching list of collections from workspace"
echo "curl -o ${COLLECTIONS_LIST_FILE} --location 'https://api.getpostman.com/collections?workspace=${WORKSPACE_ID}' --header 'X-API-Key: **********'"
execute_curl --show-error --fail --silent \
  --retry 3 --retry-delay 30 --retry-max-time 1200 --retry-all-errors \
  -o "${COLLECTIONS_LIST_FILE}" \
  --location "https://api.getpostman.com/collections?workspace=${WORKSPACE_ID}" \
  --header "X-API-Key: ${POSTMAN_API_KEY}"

if ! jq -e '.collections' "${COLLECTIONS_LIST_FILE}" > /dev/null 2>&1; then
  echo "ERROR: Failed to fetch collections list - response missing 'collections' key"
  exit 1
fi

collection_count=$(jq '.collections | length' "${COLLECTIONS_LIST_FILE}")
if [[ "${collection_count}" -eq 0 ]]; then
  echo "[INFO] No collections found in workspace"
  exit 0
fi

echo "Current collections in the workspace:"
jq '.collections[] | {id, name}' "${COLLECTIONS_LIST_FILE}"

deleted=0

while IFS= read -r row; do
  id=$(echo "${row}" | jq -r '.id')
  name=$(echo "${row}" | jq -r '.name')

  # Never delete the starred (current) collection
  if [[ "${name}" == *"⭐"* ]]; then
    echo "[SKIP] Keeping starred (current) collection: ${name}"
    continue
  fi

  # Extract version date (YYYY-MM-DD) from the collection name
  version=$(echo "${name}" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1 || true)
  if [[ -z "${version}" ]]; then
    echo "[SKIP] Keeping collection with no version date in name: ${name}"
    continue
  fi

  # Condition 1: version must NOT be in versions.json
  in_versions=$(jq --arg v "${version}" 'map(select(. == $v)) | length' "${VERSIONS_JSON}")
  if [[ "${in_versions}" -gt 0 ]]; then
    echo "[SKIP] Keeping collection for active version ${version}: ${name}"
    continue
  fi

  # delete
  echo "[DELETE] Removing collection: ${name} (id: ${id})"
  echo "curl --request DELETE --location 'https://api.getpostman.com/collections/${id}' --header 'X-API-Key: **********'"

  http_code=$(execute_curl --silent --show-error \
    --write-out "%{http_code}" \
    -o /dev/null \
    --request DELETE \
    --location "https://api.getpostman.com/collections/${id}" \
    --header "X-API-Key: ${POSTMAN_API_KEY}")

  if [[ "${http_code}" != "200" ]]; then
    echo "[ERROR] Failed to delete collection: ${name} (id: ${id}), HTTP status: ${http_code}"
  else
    deleted=$((deleted + 1))
  fi

done < <(jq -c '.collections[]' "${COLLECTIONS_LIST_FILE}")

echo "[SUMMARY] Deleted ${deleted} sunsetted collection(s)"
