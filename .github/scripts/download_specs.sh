#!/usr/bin/env bash
set -eou pipefail

aws s3 cp s3://"${S3_BUCKET}"/openapi/foas-metadata.json foas-metadata.json
< foas-metadata.json jq 

jq -c '.services[]' foas-metadata.json | while read -r service; do
    name=$(echo "${service}" | jq -c '.name' | tr -d '"')
    sha=$(echo "${service}" | jq -c '.sha' | tr -d '"')

    echo "Downloading the OpenAPI Spec for ${name} with sha ${sha}"
    aws s3 cp "s3://${S3_BUCKET}/openapi/oas/${name}/${sha}.json" "openapi-${name}.json"
done

