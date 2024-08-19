#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Upload collection to Postman
# Environment variables:
#   OPENAPI_FOLDER - folder for saving openapi file
#   TMP_FOLDER - folder for temporary files during transformations
#   VERSION_FILE_NAME - name of the file where the current version is stored
#   COLLECTION_TRANSFORMED_FILE_NAME - transformed collection file name to save to
#   COLLECTIONS_LIST_FILE - file containing a list of collections in the Postman Workspace
#   POSTMAN_API_KEY - API Key for Postman API
#   WORKSPACE_ID - Identifier for current Postman Workspace
#########################################################

OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
TMP_FOLDER=${TMP_FOLDER:-"../tmp"}
VERSIONS_FILE=${VERSIONS_FILE:-"versions.json"}
COLLECTION_TRANSFORMED_FILE_NAME=${COLLECTION_TRANSFORMED_FILE_NAME:-"collection-transformed.json"}
COLLECTIONS_LIST_FILE=${COLLECTIONS_LIST_FILE:-"collections-list.json"}
VERSION_FILE_NAME=${VERSION_FILE_NAME:-"version.txt"}

current_api_revision=$(<"$OPENAPI_FOLDER/$VERSION_FILE_NAME")
collection_transformed_path="${PWD}/${TMP_FOLDER}/${COLLECTION_TRANSFORMED_FILE_NAME}"

pushd "${OPENAPI_FOLDER}"

current_collection_name="MongoDB Atlas Administration API ${current_api_revision}"

echo "Fetching list of current collections"
curl --show-error --fail --silent -o "${COLLECTIONS_LIST_FILE}" \
     --location "https://api.getpostman.com/collections?workspace=${WORKSPACE_ID}" \
     --header "X-API-Key: ${POSTMAN_API_KEY}"

collection_exists=$(jq '.collections | any(.name=="'"${current_collection_name}"'")' "${COLLECTIONS_LIST_FILE}")

if [  "$collection_exists" = "false" ]; then
  # Create new collection
  echo "Creating new remote collection ${current_collection_name}"
  curl --show-error --fail --retry 5 --retry-all-errors --silent \
       --location "https://api.getpostman.com/collections?workspace=${WORKSPACE_ID}" \
       --header "Content-Type: application/json" \
       --header "X-API-Key: ${POSTMAN_API_KEY}" \
       --data "@${collection_transformed_path}"

else
  # Find collection ID and update collection
  echo "Updating remote collection ${current_collection_name}"
  collection_id=$(jq -r '.collections | map(select(.name=="'"${current_collection_name}"'").id)[0]' "${COLLECTIONS_LIST_FILE}")
  curl --show-error --fail --retry 5 --retry-all-errors --silent --request PUT \
       --location "https://api.getpostman.com/collections/${collection_id}" \
       --header "Content-Type: application/json" \
       --header "X-API-Key: ${POSTMAN_API_KEY}" \
       --data "@${collection_transformed_path}"
fi

popd -0
