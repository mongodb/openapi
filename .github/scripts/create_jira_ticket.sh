#!/bin/bash

# This script creates a JIRA ticket if one does not already exist with the same title.
# It performs the following steps:
# 1. Defines a function to URL encode a given string.
# 2. URL encodes the JIRA ticket title.
# 3. Checks if a JIRA ticket with the same title already exists in the specified project (id=10984) and component (id=35986).
# 4. If a ticket already exists, it exits without creating a new ticket.
# 5. If no ticket exists, it creates a new JIRA ticket with the provided title and description.
# 6. Outputs the ID of the created JIRA ticket and sets it as a GitHub Actions output variable.

set -eou pipefail

url_encode() {
    local string="$1"
    local encoded=""
    encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$string'''))")
    echo "$encoded"
}

encoded_jira_ticket_title=$(url_encode "${JIRA_TICKET_TITLE:?}")
echo "${encoded_jira_ticket_title}"

found_issue=$(curl --request GET \
                --url 'https://jira.mongodb.org/rest/api/2/search?jql=project=10984%20AND%20issuetype=12%20AND%20component=35986%20AND%20summary~"'"${encoded_jira_ticket_title:?}"'"' \
                --header 'Authorization: Bearer '"${JIRA_API_TOKEN:?}" \
                --header 'Accept: application/json' \
                --header 'Content-Type: application/json' | jq .total)

if [ "$found_issue" -ne 0 ]; then
    echo "There is already a Jira ticket with the title \"${JIRA_TICKET_TITLE:?}\""
    echo "No new Jira ticket will be created."
    exit 0
fi

json_response=$(curl --request POST \
--url 'https://jira.mongodb.org/rest/api/2/issue' \
--header 'Authorization: Bearer '"${JIRA_API_TOKEN:?}" \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{
    "fields": {
        "project": {
            "id": "10984"
        },
        "summary": "'"${JIRA_TICKET_TITLE:?}"'",
        "issuetype": {
            "id": "12"
        },
        "customfield_12751": [{
                "id": "22223"
        }],
        "description": "'"${JIRA_TICKET_DESCRIPTION:?}"'",
        "components": [
            {
                "id": "35986"
            }
        ]
    }
}')

echo "Response: ${json_response}"

JIRA_TICKET_ID=$(echo "${json_response}" | jq -r '.key')

echo "The following JIRA ticket has been created: ${JIRA_TICKET_ID}"
echo "jira-ticket-id=${JIRA_TICKET_ID}" >> "${GITHUB_OUTPUT}"
