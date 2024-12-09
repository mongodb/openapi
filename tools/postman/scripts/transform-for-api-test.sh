#!/usr/bin/env bash
set -euo pipefail

#########################################################
#  Test for transformation 
#  To be run after transformation is done
#########################################################

COLLECTION_FILE_NAME=${COLLECTION_FILE_NAME:-"collection.json"}
TMP_FOLDER=${TMP_FOLDER:-"../tmp"}
COLLECTION_TRANSFORMED_FILE_NAME=${COLLECTION_TRANSFORMED_FILE_NAME:-"collection-transformed.json"}

pushd "${TMP_FOLDER}"

# Ensure the necessary files exist
if [[ ! -f "$COLLECTION_FILE_NAME" ]]; then
  echo "Error: Collection file not found at $COLLECTION_FILE_NAME"
  exit 1
fi

# Test: Disable query params by default
echo "Disabling query params by default test"
if jq -e '.. | select(.request? != null).request.url.query[] | select(.disabled == true)' $COLLECTION_TRANSFORMED_FILE_NAME > /dev/null; then
  echo "Test Passed: Query params disabled successfully."
else
  echo "Test Failed: Query params disabling failed."
fi

# Test: Remove _postman_id
if ! jq -e '.collection.info._postman_id' $COLLECTION_TRANSFORMED_FILE_NAME > /dev/null; then
  echo "Test Passed: _postman_id removed successfully."
else
  echo "Test Failed: _postman_id removal failed."
fi

# Test : Add baseUrl property
echo "Adding baseUrl property test"
if jq -e '.collection.variable[0] | (.key == "baseUrl" and has("value"))' $COLLECTION_TRANSFORMED_FILE_NAME > /dev/null; then
  echo "Test Passed: The first item in the variable array has key set to \"baseUrl\" and has a value property."
else
  echo "Test Failed: The first item in the variable array does not have the expected key or value properties."
fi

