#!/usr/bin/env bash
# get_list_files_to_delete.sh returns a list of files in the repo that are related to "Upcoming" api versions
# that are released to a "Stable" api and are not longer needed.
# This script is used in the release cleanup pipeline.
set -eou pipefail

pushd openapi/v2
upcoming_api_versions=$(find . -maxdepth 1 -name 'openapi-*.upcoming.json' -exec basename {} \; | sed -e "s/^openapi-//" -e "s/\.json$//")
echo "upcoming_api_versions:"
echo "${upcoming_api_versions}"

api_versions=$(cat versions.json)
echo "api_versions: ${api_versions}"


if [ -z "${upcoming_api_versions}" ]; then
  echo "No upcoming API versions found. Exiting."
  exit 0
fi

files_to_delete=()
# Populate upcoming_array line by line from the multi-line upcoming_api_versions string
while IFS= read -r line; do
  # Add to array only if line is not empty
  if [ -n "$line" ]; then
    upcoming_array+=("$line")
  fi
done <<< "${upcoming_api_versions}"
echo "upcoming_array: ${upcoming_array[*]}"

for upcoming_version_item in "${upcoming_array[@]}"; do
  # Check if the exact upcoming_version_item string (e.g., "2023-01-01.upcoming"),
  # when quoted (e.g., "\"2023-01-01.upcoming\""), is NOT found in the api_versions string.
  # The condition is true if grep does not find the string (exit status 1).
  echo "upcoming_version_item: $upcoming_version_item"
  if ! echo "${api_versions}" | grep -qF "\"${upcoming_version_item}\""; then
    # If upcoming_version_item is NOT found in api_versions,
    # add its corresponding OpenAPI file name (e.g., openapi-2023-01-01.upcoming.json)
    # to the files_to_delete array.
    files_to_delete+=("openapi-${upcoming_version_item}.json")
    files_to_delete+=("openapi-${upcoming_version_item}.yaml")
  fi
done

# Display the files marked for deletion
if [ ${#files_to_delete[@]} -gt 0 ]; then
  echo "V2_OPEN_API_FILES_TO_DELETE=${files_to_delete[*]}" >> "${GITHUB_ENV:?}"
  for file_to_del in "${files_to_delete[@]}"; do
    echo "${file_to_del}"
  done
else
  echo "No files marked for deletion."
fi

popd

