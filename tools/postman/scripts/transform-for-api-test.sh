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


# Test: Wrap Collection in "collection" tag
echo "Wrapping Collection $COLLECTION_FILE_NAME in \"collection\" tag"
jq '{"collection": .}' "$COLLECTION_FILE_NAME" > intermediateCollectionWrapped.json

if jq -e '.collection' intermediateCollectionWrapped.json > /dev/null; then
  echo "Test Passed: Collection wrapped successfully."
else
  echo "Test Failed: Collection wrapping failed."
fi

# Test: Disable query params by default
echo "Disabling query params by default"
# jq '(.. | select(.request? != null).request.url.query[].disabled) = true' \
#   intermediateCollectionWrapped.json > intermediateCollectionDisableQueryParam.json

if jq -e '.. | select(.request? != null).request.url.query[] | select(.disabled == true)' intermediateCollectionDisableQueryParam.json > /dev/null; then
  echo "Test Passed: Query params disabled successfully."
else
  echo "Test Failed: Query params disabling failed."
fi

# Test: Remove _postman_id
# echo "Removing _postman_id"
# jq 'del(.collection.info._postman_id)' \
#   intermediateCollectionDisableQueryParam.json > intermediateCollectionNoPostmanID.json

if ! jq -e '.collection.info._postman_id' intermediateCollectionNoPostmanID.json > /dev/null; then
  echo "Test Passed: _postman_id removed successfully."
else
  echo "Test Failed: _postman_id removal failed."
fi

# Test: Remove circular references
echo "Removing circular references"
sed 's/\\"value\\": \\"<Circular reference to #[^>"]* detected>\\"//g' intermediateCollectionNoPostmanID.json > intermediateCollectionNoCircular.json

if ! grep -q '<Circular reference to #' intermediateCollectionNoCircular.json; then
  echo "Test Passed: Circular references removed successfully."
else
  echo "Test Failed: Circular references removal failed."
fi

# Test: Remove all variables
echo "Removing all variables. We use environment for variables instead"
jq '.collection.variable = []' \
  intermediateCollectionWithDescription.json > intermediateCollectionWithNoVarjson.json

if jq -e '.collection.variable | length == 0' intermediateCollectionWithNoVarjson.json > /dev/null; then
  echo "Test Passed: Variables removed successfully."
else
  echo "Test Failed: Variables removal failed."
fi

# Test : Add baseUrl property
echo "Adding baseUrl property $BASE_URL"
jq --arg base_url "$BASE_URL" \
  '.collection.variable[0].value = $base_url' \
  intermediateCollectionWithNoVarjson.json > intermediateCollectionWithBaseURL.json

if jq -e --arg base_url "$BASE_URL" '.collection.variable[0].value == $base_url' intermediateCollectionWithBaseURL.json > /dev/null; then
  echo "Test Passed: baseUrl property added successfully."
else
  echo "Test Failed: baseUrl property addition failed."
fi

# End of test script
