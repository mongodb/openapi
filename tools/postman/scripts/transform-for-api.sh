#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Prepare collection for Postman API
# Environment variables:
#   COLLECTION_FILE_NAME - name of the postman collection file
#   COLLECTION_TRANSFORMED_FILE_NAME - name of the transformed collection file
#   OPENAPI_FILE_NAME - name of the openapi specification file
#   OPENAPI_FOLDER - folder where openapi file is saved
#   TMP_FOLDER - folder for temporary files during transformations
#   TOGGLE_USE_ENVIRONMENT_AUTH - bool for if auth variables are stored at the environment or collection level
#   TOGGLE_INCLUDE_BODY - bool for if generated bodies should be removed or kept
#   VERSIONS_FILE - name for the openapi versions file
#   BASE_URL - the default base url the Postman Collection will use
#########################################################

COLLECTION_FILE_NAME=${COLLECTION_FILE_NAME:-"collection.json"}
COLLECTION_TRANSFORMED_FILE_NAME=${COLLECTION_TRANSFORMED_FILE_NAME:-"collection-transformed.json"}
OPENAPI_FILE_NAME=${OPENAPI_FILE_NAME:-"atlas-api.json"}
OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
TMP_FOLDER=${TMP_FOLDER:-"../tmp"}
VERSIONS_FILE=${VERSIONS_FILE:-"versions.json"}

TOGGLE_USE_ENVIRONMENT_AUTH=${TOGGLE_USE_ENVIRONMENT_AUTH:-true}
TOGGLE_INCLUDE_BODY=${TOGGLE_INCLUDE_BODY:-true}

current_api_revision=$(jq -r '.versions."2.0" | .[-1]' < "${OPENAPI_FOLDER}/${VERSIONS_FILE}")

pushd "${TMP_FOLDER}"

echo "Wrapping Collection in \"collection\" tag"
jq '{"collection": .}' "$COLLECTION_FILE_NAME" > intermediateCollectionWrapped.json

echo "Disabling query params by default"
jq '(.. | select(.request? != null).request.url.query[].disabled) = true ' \
  intermediateCollectionWrapped.json > intermediateCollectionDisableQueryParam.json

# This is to be removed because it is autogenerated when a new collection is created
echo "Removing _postman_id"
jq 'del(.collection.info._postman_id)' \
  intermediateCollectionDisableQueryParam.json > intermediateCollectionNoPostmanID.json

echo "Removing circular references"
sed 's/\\"value\\": \\"<Circular reference to #[^>"]* detected>\\"//g' intermediateCollectionNoPostmanID.json > intermediateCollectionNoCircular.json

echo "Updating name with version"
jq --arg api_version "$current_api_revision" \
  '.collection.info.name = ("MongoDB Atlas Administration API " + $api_version)' \
  intermediateCollectionNoCircular.json >  intermediateCollectionWithName.json

echo "Updating baseUrl"
jq --arg base_url "$BASE_URL" \
  '.collection.variable[0].value = $base_url' \
  intermediateCollectionWithName.json > intermediateCollectionWithBaseURL.json

echo "Adding links to docs"
cp intermediateCollectionWithBaseURL.json intermediateCollectionWithLinks.json

# Store all paths to requests. The summary field is the same as the title in the collection
paths=$(jq 'path(.. | objects | select(has("summary"))) | @sh' "$OLDPWD"/"$OPENAPI_FOLDER"/"$OPENAPI_FILE_NAME")
declare -a paths_array="($paths)"

for path in "${paths_array[@]}"; do
  declare -a single_path_array="($path)"
  path_json=$(jq -n '$ARGS.positional' --args "${single_path_array[@]}")

  # Use the path to get all the information about this request without searching
  requestInfo=$(jq --argjson path "$path_json" 'getpath($path)' "$OLDPWD"/"$OPENAPI_FOLDER"/"$OPENAPI_FILE_NAME")

  title=$(echo "$requestInfo" | jq -r '.summary')
  operationId=$(echo "$requestInfo" | jq -r '.operationId')
  tag=$(echo "$requestInfo" | jq -r '.tags[0]' | tr " " "-")

  url="https://mongodb.com/docs/atlas/reference/api-resources-spec/v2/#tag/${tag}/operation/$operationId"

  # Search the collection for the request with the matching name. Add the link to its description 
  jq --arg title "$title" --arg url "$url" \
    'first(.collection.item[].item[].request |  select(.name == $title).description.content) += "\n\nFind out more at " + $url' \
    intermediateCollectionWithLinks.json > tmp.json && mv tmp.json intermediateCollectionWithLinks.json

done

# Togglable features 
if [ "$TOGGLE_INCLUDE_BODY" = "false" ]; then
  echo "Removing generated bodies"
  jq '.collection.item[].item[].response[].body |= ""' \
    intermediateCollectionWithLinks.json > intermediateCollectionRemovedResponseBody.json
  
  jq '.collection.item[].item[].request.body |= {}' \
    intermediateCollectionRemovedResponseBody.json > intermediateCollectionRemovedRequestBody.json
  
  jq '.collection.item[].item[].response[].originalRequest.body |= {}' \
    intermediateCollectionRemovedRequestBody.json > intermediateCollectionPostBody.json

  rm intermediateCollectionRemovedResponseBody.json intermediateCollectionRemovedRequestBody.json
else
  cp intermediateCollectionWithLinks.json intermediateCollectionPostBody.json
fi

if [ "$TOGGLE_USE_ENVIRONMENT_AUTH" = "false" ]; then
  echo "Adding auth variables"
  jq '.collection.variable += [{"key": "digestAuthUsername", "value": "<string>"},
  {"key": "digestAuthPassword", "value": "<string>"},
  {"key": "realm", "value": "<string>"}]' intermediateCollectionPostBody.json > "$COLLECTION_TRANSFORMED_FILE_NAME"
else
  cp intermediateCollectionPostBody.json "$COLLECTION_TRANSFORMED_FILE_NAME"
fi

# Clean up temporary files
echo "Removing temporary files"
rm intermediateCollectionWrapped.json \
   intermediateCollectionDisableQueryParam.json \
   intermediateCollectionNoPostmanID.json \
   intermediateCollectionNoCircular.json \
   intermediateCollectionWithName.json \
   intermediateCollectionWithBaseURL.json \
   intermediateCollectionWithLinks.json \
   intermediateCollectionPostBody.json 

popd -0
