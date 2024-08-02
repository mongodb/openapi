#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Convert from OpenAPI to PostmanV2 Collection
# Environment variables:
#   OPENAPI_FILE_NAME - name of the openapi file
#   OPENAPI_FOLDER - folder where openapi file is saved
#   COLLECTION_FILE_NAME - name of the postman collection file
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

echo "Converting from OpenAPI to PostmanV2"
./node_modules/.bin/openapi2postmanv2 -s "$TMP_FOLDER"/tmp.json -o "$TMP_FOLDER"/"$COLLECTION_FILE_NAME" -O folderStrategy=Tags

rm "$TMP_FOLDER"/tmp.json
