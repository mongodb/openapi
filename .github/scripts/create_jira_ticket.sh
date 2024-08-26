#!/bin/bash
set -eou pipefail

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
        "summary": "('"${TARGET_ENV:?}"') The '"${RELEASE_NAME:?}"' release has failed",
        "issuetype": {
            "id": "12"
        },
        "customfield_12751": [{
                "id": "22223"
        }],                  
        "description": "The release process "'"${RELEASE_NAME:?}"'" in [mongodb/openapi|https://github.com/mongodb/openapi] has failed. Please, look at the [issue-'"${ISSUE_ID:?}"'|https://github.com/mongodb/openapi/issues/'"${ISSUE_ID}"'] for more details.",
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
