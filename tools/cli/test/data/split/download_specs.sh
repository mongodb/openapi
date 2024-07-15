#!/bin/bash
set -ex

link=$1 # The link to the specs from the task OPENAPI_GENERATE_SPECS, find the mciupload link
branch=$2 # The branch you are downloading the specs from

if [ -z "$link" ]; then
  echo "Please provide a link to the specs"
  exit 1
fi

if [ -z "$branch" ]; then
  echo "Please provide a branch"
  exit 1
fi

BASEDIR=$(dirname "$0")
format=("yaml" "json")
versions=("2023-01-01" "2023-02-01" "2023-10-01" "2023-11-15" "2024-05-30")

for version in "${versions[@]}"; do
  for fmt in "${format[@]}"; do
    full_link=$link/openapi-v2-$version.$fmt
    echo "Downloading specs for version $version on link $full_link"
    curl -f --show-error  $full_link --output $BASEDIR/openapi-v2-$version.$fmt
  done
done

for fmt in "${format[@]}"; do
  full_link=$link/openapi-v2.$fmt
  echo "Downloading specs for version v2-all on link $full_link"
  curl -f --show-error $full_link --output $BASEDIR/openapi-v2.$fmt
done

# Find the commit sha version and write to a readme file
commit_sha=$(echo "$full_link" | awk -F'mms/' '{print $2}' | awk -F'/' '{print $1}')
readme_file="$BASEDIR/README.md"

# Write or update the README file
echo "The last update for this folder was with commit SHA \"$commit_sha\"" in branch $branch > $readme_file

# Output a confirmation message
echo "Updated $readme_file with the latest commit SHA."

