#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

#########################################################
# Fetch openapi from remote file
# Environment variables:
#   OPENAPI_FILE_NAME - openapi file name to use
#   OPENAPI_FOLDER - folder for saving openapi file
#   COLLECTION_FILE_NAME - postman collection file name to save to
#   TMP_FOLDER - folder for temporary files during transformations
#########################################################

OPENAPI_FILE_NAME=${OPENAPI_FILE_NAME:-"atlas-api.json"}
COLLECTION_FILE_NAME=${COLLECTION_FILE_NAME:-"collection.json"}
OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
TMP_FOLDER=${TMP_FOLDER:-"../tmp"}

echo "Removing regex"
jq 'del(.. | select(type == "object") | .pattern?)' "$OPENAPI_FOLDER"/"$OPENAPI_FILE_NAME" > "$TMP_FOLDER"/tmp.json

echo "Installing openapi-to-postmanv2"
npm install
openapi2postmanv2 -s "$TMP_FOLDER"/tmp.json -o "$TMP_FOLDER"/"$COLLECTION_FILE_NAME" -O folderStrategy=Tags

rm "$TMP_FOLDER"/tmp.json
