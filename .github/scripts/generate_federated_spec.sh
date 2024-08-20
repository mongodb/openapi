#!/usr/bin/env bash
set -eou pipefail

# Loop through the filtered services and construct the flag
service_array=()
while IFS= read -r service; do
service_array+=("-e" "openapi-${service}.json")
done < <(jq -r '.services[] | select(.name != "mms") | .name' foas-metadata.json)

echo "Running FOAS CLI merge command with the following services: " "${service_array[@]}"
foascli merge -b openapi-mms.json "${service_array[@]}" -o openapi-foas.json -x -f json --sha "${FOAS_SHA}"
foascli merge -b openapi-mms.json "${service_array[@]}" -o openapi-foas.yaml -x -f yaml --sha "${FOAS_SHA}"

