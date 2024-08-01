#!/usr/bin/env bash
set -eou pipefail

echo "Running FOAS CLI split command with the following --env=${target_env} and -o=./openapi/v2/openapi.json"

foascli split -s openapi-foas.json --env "${target_env}" -o ./openapi/v2/openapi.json
cp -rf "openapi-foas.json" "./openapi/v2.json"

foascli split -s openapi-foas.yaml --env "${target_env}" -o ./openapi/v2/openapi.yaml
cp -rf "openapi-foas.yaml" "./openapi/v2.yaml"

