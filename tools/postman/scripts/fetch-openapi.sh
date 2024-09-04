#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Fetch openapi from remote file
# Environment variables:
#   OPENAPI_FILE_NAME - openapi file name to use
#   OPENAPI_FOLDER - folder for saving openapi file
#   FULL_OPENAPI_FOLDER - folder where openapi files are stored
#   VERSION_FILE_NAME - name of the file where the current version is stored
#########################################################

OPENAPI_FILE_NAME=${OPENAPI_FILE_NAME:-"atlas-api.json"}
FULL_OPENAPI_FOLDER=${FULL_OPENAPI_FOLDER:-"../../../openapi/v2/"}
OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
VERSION_FILE_NAME=${VERSION_FILE_NAME:-"version.txt"}

# Get the latest file by sorting lexicographically and store the full filename
echo "Fetching latest version of the OpenAPI Spec"
latest_openapi_filename=$(find "$FULL_OPENAPI_FOLDER"/openapi-????-??-??.json 2>/dev/null | sort -r | head -n 1)

# Extract the version from the filename 
latest_version=$(basename "$latest_openapi_filename" .json | cut -d '-' -f2-)
echo "Latest version is $latest_version"
echo "$latest_version" > "$OPENAPI_FOLDER"/"$VERSION_FILE_NAME"

cp  "$latest_openapi_filename" "$OPENAPI_FOLDER"/"$OPENAPI_FILE_NAME"
