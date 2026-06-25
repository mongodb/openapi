#!/usr/bin/env bash
# get_sunset_date_drift.sh - Identifies APIs with sunset date drifts between two OpenAPI 
# specifications 
#
# This script queries 2 OpenAPI specifications provided to find API versions that will be
# sunset within a specified date range, and where the sunset dates differ between the OASes. When 
# sunset drifts are found, it generates a hash code from the results to help with deduplication in 
# downstream processes (like JIRA ticket creation) and saves the list to a file.
#
# Usage:
#   ./get_sunset_date_drift.sh <base_openapi_spec_url> <openapi_spec_url> <to_date> <output_file_name>
#
# Parameters:
#   base_openapi_spec_url - URL of the "base" OAS to analyze
#   openapi_spec_url - URL of the "comparison" OAS to analyze for qa drift against dev
#   to_date - End date for the sunset check (format: YY-MM-DD)
#   output_file_name - Name of the output file to save sunset drifts
#   output_hash_name - Name of the GitHub Actions output variable to save the hash code
#
# Outputs:
#   - Prints information about sunset drifts to stdout
#   - Writes <output_hash_name> to GitHub Actions output if sunset drifts are found
#   - Creates <output_file_name> containing the list of sunset drifts if any are found
#
# Dependencies:
#   - foascli - CLI tool for querying sunset information from OpenAPI specs
#   - jq - JSON processor for hash code generation
#
# Exit Status:
#   - 0 if the script completes successfully, regardless if sunset drifts are found
#   - Non-zero if any commands fail (due to set -e)
set -eou pipefail

if [ $# -lt 2 ]; then
  echo "Error: Missing required arguments"
  echo "Usage: ./get_sunset_date_drift.sh <base_openapi_spec_url> <openapi_spec_url> <to_date> <output_file_name> <output_hash_name>"
  echo "Example: ./get_sunset_date_drift.sh openapi/v2-dev.json openapi/v2-prod.json 2025-09-22 output.json output_hash"
  exit 1
fi

base_openapi_spec_url="$1"
openapi_spec_url="$2"
to_date="$3"
output_file_name="$4"
output_hash_name="$5"
from_date=$(date +"%Y-%m-%d")

echo "base_openapi_spec_url: ${base_openapi_spec_url}"
echo "openapi_spec_url: ${openapi_spec_url}"
echo "from_date: ${from_date}, to_date: ${to_date}"

sunset_drifts=$(foascli sunset diff --base "${base_openapi_spec_url}" --spec "${openapi_spec_url}" --from "${from_date}" --to "${to_date}")
if [[ "${sunset_drifts}" != "null" ]]; then
  echo "APIs sunsetting between '${from_date}' - '${to_date}' with sunset date drifts between '${base_openapi_spec_url}' and '${openapi_spec_url}' are: ${sunset_drifts}"

  # we calculate the md5sum of the json object which will be included in the jira ticket title.
  # this approach ensures we create a new jira ticket only if the there is not already a ticket
  # with the same title
  hash_code_sunset_drifts=$(echo "${sunset_drifts}" | jq -cs . | md5sum | awk '{print $1}')
  echo "hash: ${hash_code_sunset_drifts}"
  echo "${output_hash_name}=${hash_code_sunset_drifts}" >> "${GITHUB_OUTPUT:?}"
  echo "${sunset_drifts}" > "${output_file_name}"

else
  echo "No APIs sunsetting between '${from_date}' - '${to_date}' have sunset date drifts between the provided OASes."
fi
