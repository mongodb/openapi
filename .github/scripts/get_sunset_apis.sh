#!/usr/bin/env bash
# get_sunset_apis.sh - Identifies API versions scheduled for sunset
#
# This script queries an OpenAPI specification to find API versions that will be
# sunset within a specified date range. When sunset APIs are found,
# it generates a hash code from the results to help with deduplication in
# downstream processes (like JIRA ticket creation) and saves the list to a file.
#
# Usage:
#   ./get_sunset_apis.sh <openapi_spec_url> <to_date>
#
# Parameters:
#   openapi_spec_url - URL of the OpenAPI specification to analyze
#   to_date - End date for the sunset check (format: YY-MM-DD)
#
# Outputs:
#   - Prints information about sunset APIs to stdout
#   - Writes hash_code_sunset_apis to GitHub Actions output if sunset APIs are found
#   - Creates sunset_apis.json containing the list of sunset APIs if any are found
#
# Dependencies:
#   - foascli - CLI tool for querying sunset information from OpenAPI specs
#   - jq - JSON processor for hash code generation
#
# Exit Status:
#   - 0 if the script completes successfully, regardless if sunset APIs are found
#   - Non-zero if any commands fail (due to set -e)
set -eou pipefail

openapi_spec_url="$1"
to_date="$2"
from_date=$(date +"%y-%m-%d")

echo "openapi_spec_url: ${openapi_spec_url}"
echo "from_date: ${from_date}, to_date: ${to_date}"

sunset_apis=$(foascli sunset ls -s "${openapi_spec_url}" --from "${from_date}" --to "${to_date}")
if [[ "${sunset_apis}" != "null" ]]; then
  echo "api versions that will be sunsets between '${from_date}' - '${to_date}' are: ${sunset_apis}"

  # we calculate the md5sum of the json object which will be included in the jira ticket title.
  # this approach ensures we create a new jira ticket only if the there is not already a ticket
  # with the same title
  hash_code_sunset_apis=$(echo "${sunset_apis}" | jq -cs . | md5sum | awk '{print $1}')
  echo "hash: ${hash_code_sunset_apis}"
  echo hash_code_sunset_apis="${hash_code_sunset_apis}" >> "${GITHUB_OUTPUT:?}"
  echo "${sunset_apis}" > sunset_apis.json

else
  echo "no api versions will be sunset within the next 3 months."
fi
