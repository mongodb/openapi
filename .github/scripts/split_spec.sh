#!/usr/bin/env bash
set -eou pipefail

echo "Running FOAS CLI versions command"
foascli versions -s openapi-foas.json -o ./openapi/v2/versions.json --env "${target_env:?}" --stability-level stable  --stability-level preview

echo "Running FOAS CLI split command with the following --env=${target_env:?} and -o=./openapi/v2/openapi.json"

# Generate one OAS per version based on the versioning extensions
foascli split -s openapi-foas.json --env "${target_env:?}" -o ./openapi/v2/openapi.json --format all

# Filters out the current foas, removing all extensions that are not related with versioning
foascli filter -s openapi-foas.json --env "${target_env:?}" -o ./openapi/v2.json --format all

# Moves the unfiltered OAS to the raw folder
mkdir -p ./openapi/.raw
mv -f "openapi-foas.json" "./openapi/.raw/v2.json"
mv -f "openapi-foas.yaml" "./openapi/.raw/v2.yaml"

# Create folder if it does not exist
mkdir -p ./openapi/v2/private

echo "Moving preview files to preview and private-preview folder"
find ./openapi/v2 -type f -name "*private-preview*" -exec mv -f {} ./openapi/v2/private/ \;

echo "Generate the versions.json file for private preview APIs"
foascli versions --spec ./openapi/.raw/v2.json --stability-level PRIVATE-PREVIEW -o ./openapi/v2/private/versions.json --env "${target_env:?}"
