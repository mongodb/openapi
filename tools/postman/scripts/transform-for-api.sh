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
#   VERSION_FILE_NAME - name of the file where the current version is stored
#   DESCRIPTION_FILE - name for the markdown description file
#   TOGGLE_INCLUDE_BODY - bool for if generated bodies should be removed or kept
#   TOGGLE_ADD_DOCS_LINKS - updates requests with corresponding docs links
#   TOKEN_URL_ENV - client credentials auth path to set at the environment level, will not be set if unpopulated
#   BASE_URL - the default base url the Postman Collection will use
#########################################################

COLLECTION_FILE_NAME=${COLLECTION_FILE_NAME:-"collection.json"}
COLLECTION_TRANSFORMED_FILE_NAME=${COLLECTION_TRANSFORMED_FILE_NAME:-"collection-transformed.json"}
OPENAPI_FILE_NAME=${OPENAPI_FILE_NAME:-"atlas-api.json"}
OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
TMP_FOLDER=${TMP_FOLDER:-"../tmp"}
VERSION_FILE_NAME=${VERSION_FILE_NAME:-"version.txt"}
DESCRIPTION_FILE=${DESCRIPTION_FILE:-"../collection-description.md"}

TOGGLE_INCLUDE_BODY=${TOGGLE_INCLUDE_BODY:-true}
TOGGLE_ADD_DOCS_LINKS=${TOGGLE_ADD_DOCS_LINKS:-true}
TOKEN_URL_ENV=${TOKEN_URL_ENV:-""}

current_api_revision=$(<"$OPENAPI_FOLDER/$VERSION_FILE_NAME")

pushd "${TMP_FOLDER}"

echo "Wrapping Collection $COLLECTION_FILE_NAME in \"collection\" tag"
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

echo "Updating name with version $current_api_revision"
jq --arg api_version "$current_api_revision" \
  '.collection.info.name = ("MongoDB Atlas Administration API " + $api_version)' \
  intermediateCollectionNoCircular.json >  intermediateCollectionWithName.json

echo "Adding Collection description to $DESCRIPTION_FILE"
description=$(<"$DESCRIPTION_FILE")
jq --arg desc "$description" \
  '.collection.info.description.content = $desc' \
  intermediateCollectionWithName.json >  intermediateCollectionWithDescription.json

echo "Removing all variables. We use environment for variables instead"
jq --arg base_url "$BASE_URL" \
  '.collection.variable = []' \
  intermediateCollectionWithDescription.json > intermediateCollectionWithNoVar.json

echo "Adding baseUrl property $BASE_URL"
jq --arg base_url "$BASE_URL" \
  '.collection.variable += [{ key: "baseUrl", value: $base_url }]' \
  intermediateCollectionWithNoVar.json > intermediateCollectionWithBaseURL.json

if [ "$TOGGLE_ADD_DOCS_LINKS" = "true" ]; then
  echo "Adding links to docs for each request"
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
else
  cp intermediateCollectionWithBaseURL.json intermediateCollectionWithLinks.json
fi

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

if [ "$TOKEN_URL_ENV" != "" ]; then
  echo "Adding client credentials auth url variable $TOKEN_URL_ENV"
  jq --arg token_url "$TOKEN_URL_ENV" '.collection.variable += [{"key": "clientCredentialsTokenUrl", "value": $token_url}]' \
  intermediateCollectionPostBody.json > "$COLLECTION_TRANSFORMED_FILE_NAME"
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
   intermediateCollectionWithDescription.json \
   intermediateCollectionWithBaseURL.json \
   intermediateCollectionWithLinks.json \
   intermediateCollectionPostBody.json \
   intermediateCollectionWithNoVar.json

popd -0
