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
    map("• " + .[0].code + " (" + (length | tostring) + " violations)") | 
    join("\n")
  ' tools/spectral/ipa/metrics/outputs/warning-violations.json)
fi

# Check if warning ticket already exists
echo "Check if a jira ticket already exists."
EXISTING_TICKET=$(curl -H "Authorization: Bearer ${JIRA_API_TOKEN}" \
  "https://jira.mongodb.org/rest/api/2/search?jql=project=CLOUDP AND summary~'Warning-level IPA violations' AND status!=Done" \
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
# Create new Jira ticket
TICKET_RESPONSE=$(curl -X POST -H "Authorization: Bearer ${JIRA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"fields\": {
      \"project\": {\"key\": \"CLOUDP\"},
      \"summary\": \"Warning-level IPA violations found\",
      \"description\": \"${DESCRIPTION}\",
      \"issuetype\": {\"name\": \"Task\"},
      \"assignee\": {\"id\": \"${TEAM_ID}\"}
    }
  }" \
  "https://jira.mongodb.org/rest/api/2/issue/")

TICKET_KEY=$(echo "${TICKET_RESPONSE}" | jq -r '.key')
if [ "${TICKET_KEY}" != "null" ]; then
  echo "Created Jira ticket: ${TICKET_KEY}."
  # Create summary for Slack
  echo "Creating Slack Summary with VIOLATION_DETAILS: ${VIOLATION_DETAILS}..."
  SLACK_SUMMARY=""
  if [ -n "${VIOLATION_DETAILS}" ]; then
    SLACK_SUMMARY=$(echo "${VIOLATION_DETAILS}" | head -3)
    if [ "$(echo "${VIOLATION_DETAILS}" | wc -l)" -gt 3 ]; then
      SLACK_SUMMARY="${SLACK_SUMMARY}\n... and more"
    fi
  fi

  echo "Send Slack notification..."
  # Send Slack notification with violation summary
  SLACK_MESSAGE="Warning-level IPA violations found (${WARNING_COUNT} violations) (${SLACK_ONCALL_USER}).

Jira ticket: https://jira.mongodb.org/browse/${TICKET_KEY}"
  
  curl -X POST -H "Authorization: Bearer ${SLACK_BEARER_TOKEN}" \
    -H "Content-type: application/json" \
    --data "{\"channel\":\"${SLACK_CHANNEL_ID}\",\"text\":\"${SLACK_MESSAGE}\"}" \
    https://slack.com/api/chat.postMessage
else
  echo "Failed to create Jira ticket"
  exit 1
fi
