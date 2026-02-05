#!/bin/bash
set -eou pipefail

echo "Handle Warning Violations: WARNING_COUNT=${WARNING_COUNT}"
if [ "${WARNING_COUNT}" -eq 0 ]; then
  echo "No warning violations found, skipping ticket creation"
  exit 0
fi

# Read violation details if available
VIOLATION_DETAILS=""
if [ -f "tools/spectral/ipa/metrics/outputs/warning-violations.json" ]; then
  VIOLATION_DETAILS=$(jq -r '
    group_by(.code) |
    map(
      "• " + .[0].code + " (" + (length | tostring) + " violations):\n" +
      (map("  - " + .component_id) | join("\n"))
    ) |
    join("\n\n")
  ' tools/spectral/ipa/metrics/outputs/warning-violations.json)
fi

# Check if warning ticket already exists
echo "Check if a jira ticket already exists."
JQL_QUERY="project=CLOUDP AND summary~'Warning-level IPA violations' AND status NOT IN (Done, Resolved, Closed)"
EXISTING_TICKET=$(curl -G -H "Authorization: Bearer ${JIRA_API_TOKEN}" \
  --data-urlencode "jql=${JQL_QUERY}" \
  "https://jira.mongodb.org/rest/api/2/search" \
  | jq -r '.issues[0].key // empty')

if [ -n "${EXISTING_TICKET}" ]; then
  echo "Warning ticket already exists: ${EXISTING_TICKET}"
  exit 0
fi


# Create detailed description
DESCRIPTION="Warning-level violations were found during IPA validation. Please review and add exceptions if valid, or address false positives.
These warning-level checks are part of the rule rollout process. See the IPA Validation Technical Documentation for details:
https://wiki.corp.mongodb.com/spaces/MMS/pages/315003555/IPA+Validation+Technical+Documentation+Runbook#IPAValidationTechnicalDocumentation%26Runbook-RolloutofNewRule

Violation Summary:
${VIOLATION_DETAILS}

Total violations: ${WARNING_COUNT}"

echo "Jira ticket does not exists. Creating..."
# Create new Jira ticket with properly escaped JSON
TICKET_RESPONSE=$(jq -n \
  --arg summary "Warning-level IPA violations found" \
  --arg description "$DESCRIPTION" \
  --arg teamId "$TEAM_ID" \
  '{
    fields: {
      project: {key: "CLOUDP"},
      summary: $summary,
      description: $description,
      issuetype: {name: "Task"},
      assignee: {id: $teamId}
    }
  }' | curl -X POST -H "Authorization: Bearer ${JIRA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @- \
  "https://jira.mongodb.org/rest/api/2/issue/")

TICKET_KEY=$(echo "${TICKET_RESPONSE}" | jq -r '.key')
if [ "${TICKET_KEY}" != "null" ]; then
  echo "Created Jira ticket: ${TICKET_KEY}."

  echo "Send Slack notification..."
  # Send Slack notification with link to Jira ticket for details
  SLACK_MESSAGE="Warning-level IPA violations found (${WARNING_COUNT} violations) (${SLACK_ONCALL_USER}).

See Jira ticket for details: https://jira.mongodb.org/browse/${TICKET_KEY}"

  curl -X POST -H "Authorization: Bearer ${SLACK_BEARER_TOKEN}" \
    -H "Content-type: application/json" \
    --data "{\"channel\":\"${SLACK_CHANNEL_ID}\",\"text\":\"${SLACK_MESSAGE}\"}" \
    https://slack.com/api/chat.postMessage
else
  echo "Failed to create Jira ticket"
  exit 1
fi
