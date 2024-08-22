#!/usr/bin/env bash
set -eou pipefail

echo "Step 1: Preparing revision folder...."
mkdir changelog/revision
cp openapi/v2/openapi-*.json changelog/revision/

echo "Generating revision metadata file"
revision_version=$(cat openapi/v2/versions.json | jq -r '.[]' | paste -sd ',' -)
RELEASE_SHA=$(cat foas-metadata.json | jq -r '.services[] | select(.name=="mms") | .sha')
foascli changelog metadata create --sha "${RELEASE_SHA}" --versions=${revision_version} > changelog/revision/metadata.json
cat changelog/revision/metadata.json

echo "Downloading exemptions.yaml from S3"
aws s3 cp "s3://${S3_BUCKET}/openapi/mms_exemptions.yaml" "changelog/revision/exemptions.yaml"

echo "Step 1: Preparing revision folder - Done"

echo "Step 2: Preparing base folder...."
mv changelog/base/openapi/v2/* changelog/base/
mv changelog/base/changelog/changelog.json changelog/base/
mv changelog/base/changelog/internal/* changelog/base/

echo "Step 2: Preparing base folder - Done"

echo "Listing base folder files"
ls -la changelog/base/

echo "Listing revision folder files"
ls -la changelog/revision/

echo "Step 3: Generating changelog files...."
foascli changelog generate -b changelog/base -r changelog/revision -e changelog/revision/exemptions.yaml -o changelog
mv changelog/revision/metadata.json changelog/internal

echo "Step 3: Generating changelog files - Done"

echo "Step4: Cleaning up - removing base and revision folder"
rm -rf changelog/base
rm -rf changelog/revision
echo "Step4: Cleaning up - removing base and revision folder - Done"

tree
