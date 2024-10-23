#!/bin/bash
set -eou pipefail

# This script checks for upcoming API version releases within the next 3 weeks.
# It performs the following steps:
# 1. Fetches and parses the `versions.json` file using in the `mongodb/openapi` repository on the `dev` branch
# 2. Gets the current date in seconds since epoch.
# 3. Determines if the system is macOS or Linux to use the appropriate `date` command format.
# 4. Iterates through each date in the `version_dates`:
#    a. Converts the date to seconds since epoch.
#    b. Calculates the difference in days between the date and the current date.
#    c. Checks if the date is within 3 weeks (21 days) and adds it to the list if it is.
# 5. Outputs the API versions that will be released in the next 3 weeks to the GitHub Actions output variable if any are found.


URL="https://raw.githubusercontent.com/mongodb/openapi/dev/openapi/v2/versions.json"

# Fetch the version.json file
response=$(curl -s "${URL}")

# Parse the version_dates from the JSON response using jq
version_dates=$(echo "${response}" | jq -r '.[]')

# Initialize an empty list to store version_dates within 3 weeks
version_dates_within_3_weeks=()

# Get the current date in seconds since epoch
current_date=$(date +%s)

# Determine if the system is macOS or Linux
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS date command format
    date_command="date -j -f %Y-%m-%d"
else
    # Linux date command format
    date_command="date -d"
fi

# Iterate through each date
for version_date in ${version_dates}; do
    # Convert the date to seconds since epoch with explicit format
    date_in_seconds=$($date_command "${version_date}" +%s 2>/dev/null)

    # Calculate the difference in days between the date and the current date
    diff_in_days=$(( (date_in_seconds - current_date) / (60 * 60 * 24) ))

    # Check if the date is within 3 weeks (21 days)
    if [[ "${diff_in_days}" -ge 0 && "${diff_in_days}" -le 21 ]]; then
        # Add the date to the list if within 3 weeks
        version_dates_within_3_weeks+=("${date}")
    fi
done

if [[ ${#version_dates_within_3_weeks[@]} -gt 0 ]]; then
    echo "API Versions that will be release in the next 3 weeks: ${version_dates_within_3_weeks[*]}"
    echo api_versions="${version_dates_within_3_weeks[*]}" >> "${GITHUB_OUTPUT:?}"
else
    echo "No API Versions that will be released within the next 3 weeks."
fi
