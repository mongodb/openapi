#!/usr/bin/env bash
set -eou pipefail

echo "Running FOAS CLI versions command"
foascli versions -s openapi-foas.json -o ./openapi/v2/versions.json --env "${target_env:?}" --stability-level stable

echo "Running FOAS CLI versions command for preview"
foascli versions -s openapi-foas.json -o ./openapi/preview/versions.json --env "${target_env:?}" --stability-level preview

echo "Running FOAS CLI split command with the following --env=${target_env:?} and -o=./openapi/v2/openapi.json"

foascli split -s openapi-foas.json --env "${target_env:?}" -o ./openapi/v2/openapi.json
mv -f "openapi-foas.json" "./openapi/v2.json"

foascli split -s openapi-foas.yaml --env "${target_env:?}" -o ./openapi/v2/openapi.yaml
mv -f "openapi-foas.yaml" "./openapi/v2.yaml"

echo "Moving preview files to preview and private-preview folder"
find ./openapi/v2 -type f -name "*private-preview*" -exec mv -f {} ./openapi/private-preview/ \;
find ./openapi/v2 -type f -name "*preview*" -exec mv -f {} ./openapi/preview/ \;
