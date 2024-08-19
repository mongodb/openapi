#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Fetch number of forks of each collection
# Environment variables:
#   OPENAPI_FOLDER - folder for saving openapi file
#   COLLECTIONS_LIST_FILE - file containing a list of collections in the Postman Workspace
#   FORKS_DATA_FILE - file containing a list fork metrics for each collection
#   POSTMAN_API_KEY - API Key for Postman API
#   WORKSPACE_ID - Identifier for current Postman Workspace
#########################################################

OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
COLLECTIONS_LIST_FILE=${COLLECTIONS_LIST_FILE:-"collections-list.json"}
FORKS_DATA_FILE=${FORKS_DATA_FILE:-"fork-data.json"}

pushd "${OPENAPI_FOLDER}"

echo "Fetching list of current collections"
curl --show-error --retry 5 --fail --silent -o "${COLLECTIONS_LIST_FILE}" \
     --location "https://api.getpostman.com/collections?workspace=${WORKSPACE_ID}" \
     --header "X-API-Key: ${POSTMAN_API_KEY}"

collection_ids=$(jq -r '.collections[].id' "$COLLECTIONS_LIST_FILE")

echo '{"collections": []}' > "$FORKS_DATA_FILE"

for collection_id in $collection_ids; do
    collection_name=$(jq -r --arg id "$collection_id" '.collections[] | select(.id==$id).name' "$COLLECTIONS_LIST_FILE")
    
    echo "Fetching fork data for collection: $collection_name" 
    response=$(curl --silent --retry 5 -w "%{http_code}" -o "current-collection.json" \
        --location "https://api.getpostman.com/collections/${collection_id}/forks" \
        --header "X-API-Key: ${POSTMAN_API_KEY}")
    
    http_code=${response: -3}

    if [ "$http_code" = "200" ]; then
        forks=$(jq '.meta.total' current-collection.json)
    else
        forks=0
    fi

    # Add the ID, Name, Forks for current collection to JSON file
    fork_data=$(jq -n --arg id "$collection_id" --arg name "$collection_name" --arg forks "$forks" \
                '{id: $id, name: $name, forks: $forks}')

    jq --argjson data "$fork_data" '.collections += [$data]' "$FORKS_DATA_FILE" > temp-"$FORKS_DATA_FILE"
    mv temp-"$FORKS_DATA_FILE" "$FORKS_DATA_FILE"

done

popd -0
