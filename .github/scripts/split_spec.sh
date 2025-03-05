#!/usr/bin/env bash
set -eou pipefail

#########################################################
# Run foas cli to split the openapi file
# Variables:
#   target_env - target environment to split the openapi file
#########################################################

echo "Running FOAS CLI versions command"
foascli versions -s openapi-foas.json -o ./openapi/v2/versions.json --env "${target_env:?}" --stability-level stable  --stability-level preview

echo "Running FOAS CLI split command with the following --env=${target_env:?} and -o=./openapi/v2/openapi.json"

foascli split -s openapi-foas.json --env "${target_env:?}" -o ./openapi/v2/openapi.json --format all
mv -f "openapi-foas.json" "./openapi/v2.json"
mv -f "openapi-foas.yaml" "./openapi/v2.yaml"

# Create folder if it does not exist
mkdir -p ./openapi/v2/private

echo "Moving preview files to preview and private-preview folder"
find ./openapi/v2 -type f -name "*private-preview*" -exec mv -f {} ./openapi/v2/private/ \;

echo "Generate the versions.json file for private preview APIs"
foascli versions --spec ./openapi/v2.json --stability-level PRIVATE-PREVIEW -o ./openapi/v2/private/versions.json --env "${target_env:?}"
