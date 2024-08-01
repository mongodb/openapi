#!/usr/bin/env bash
set -eou pipefail


env_flag=${target_env}
if [[ ${env_flag} == "staging"]]; do
    env_flag="stage"
fi

echo "Running FOAS CLI split command with the following --env=${env_flag} and -o=./openapi/v2/openapi.json"

foascli split -s openapi-foas.json --env "${env_flag}" -o ./openapi/v2/openapi.json
cp -rf "openapi-foas.json" "./openapi/v2.json"

foascli split -s openapi-foas.yaml --env "${env_flag}" -o ./openapi/v2/openapi.yaml
cp -rf "openapi-foas.yaml" "./openapi/v2.yaml"

