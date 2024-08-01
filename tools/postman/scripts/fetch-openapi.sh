#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Fetch openapi from remote file
# Environment variables:
#   OPENAPI_FILE_NAME - openapi file name to use
#   OPENAPI_FOLDER - folder for saving openapi file
#   API_BASE_URL - base URL where the spec is hosted
#   S3_BUCKET - S3 bucket where the spec is hosted
#   VERSIONS_FILE - openapi versions file name to use
#########################################################

OPENAPI_FILE_NAME=${OPENAPI_FILE_NAME:-"atlas-api.json"}
OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
API_BASE_URL=${API_BASE_URL:-"https://cloud.mongodb.com"}
S3_BUCKET=${S3_BUCKET:-"mongodb-mms-prod-build-server"}
VERSIONS_FILE=${VERSIONS_FILE:-"versions.json"}

versions_url="${API_BASE_URL}/api/openapi/versions"

pushd "${OPENAPI_FOLDER}"

echo "Fetching versions from $versions_url"
curl --show-error --fail --silent -o "${VERSIONS_FILE}" \
     -H "Accept: application/json" "${versions_url}"

## Dynamic Versioned API Version
CURRENT_API_REVISION=$(jq -r '.versions."2.0" | .[-1]' < "./${VERSIONS_FILE}")

echo "Fetching OpenAPI release sha"
sha=$(curl --show-error --fail --silent -H "Accept: text/plain" "${API_BASE_URL}/api/private/unauth/version")

echo "Fetching OAS file for ${sha}"
openapi_url="https://${S3_BUCKET}.s3.amazonaws.com/openapi/${sha}-v2-${CURRENT_API_REVISION}.json"

echo "Fetching api from $openapi_url to $OPENAPI_FILE_NAME"
curl --show-error --fail --silent -o "$OPENAPI_FILE_NAME" "$openapi_url"

popd -0 
