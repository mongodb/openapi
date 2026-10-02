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
DESCRIPTION="
h2. Context
Warning-level violations were found during IPA validation. Please review and add exceptions if valid, or address false positives.

These warning-level checks are part of the rule rollout process. See the IPA Validation Technical Documentation for details:
https://wiki.corp.mongodb.com/spaces/MMS/pages/315003555/IPA+Validation+Technical+Documentation+Runbook#IPAValidationTechnicalDocumentation%26Runbook-RolloutofNewRule

Violation Summary:
${VIOLATION_DETAILS}

Total violations: ${WARNING_COUNT}

h2. Actions

Triage new violations
 * Verify that the violations are not false-positives
 ** Inspect the OpenAPI component that violates the rule
 ** Inspect the source code
 * If the violations are correct:
 ** File a ticket for the owning team to address the violation, or add a new exception to the component if the violation has been approved by the APIx Platform team.
 * If the violations are false-positives:
 ** Create a ticket to fix the rule's implementation, correcting any bugs or adjusting the validation approach.

h2. Instructions for automation

Review the provided context, including the relevant OpenAPI specification and implementation evidence, to identify and validate team-level violations related to the CS implementation.
Objectives
* Identify every component mentioned in the OpenAPI specification and list its API owner or owning team. Cite the source for each ownership assignment.
* Group the reported violations by team. For each distinct violation group, launch a separate subagent to independently validate the finding against the available context and implementation evidence.
* Assess whether each validated issue requires a code fix, correction of an existing bug, or an adjustment to the validation approach. Do not assume a violation is valid until it has been checked.

Jira notes

Write a dedicated Jira note for each validated team-level violation. Each note should be specific, evidence-based, and include as much of the following as the provided context supports:
* Owning team and affected API/component
* Violation description and validation outcome
* Relevant implementation details and recommended correction, if supported
* Git commit and/or pull request, with links or identifiers
* Author(s), when available

Do not invent missing owners, evidence, commit/PR details, authors, or Jira targets. Clearly mark unavailable information, distinguish confirmed findings from uncertain ones, and avoid creating duplicate notes for the same violation. If there is not enough information to identify the Jira target or safely create a note, report what is missing rather than guessing.
"

echo "Jira ticket does not exist. Creating..."
# Create new Jira ticket with properly escaped JSON (matching create_jira_ticket.sh format)
TICKET_PAYLOAD=$(jq -n \
  --arg summary "Warning-level IPA violations found" \
  --arg description "$DESCRIPTION" \
  --arg teamId "$TEAM_ID" \
  '{
    fields: {
      project: {id: "10984"},
      summary: $summary,
      description: $description,
      issuetype: {id: "12"},
      customfield_12751: [{id: $teamId}],
      components: [{id: "35986"}]
    }
  }')

echo "Jira ticket payload:"
echo "${TICKET_PAYLOAD}"

TICKET_RESPONSE=$(echo "${TICKET_PAYLOAD}" | curl -X POST -H "Authorization: Bearer ${JIRA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @- \
  "https://jira.mongodb.org/rest/api/2/issue/")

echo "Jira API response:"
echo "${TICKET_RESPONSE}"

TICKET_KEY=$(echo "${TICKET_RESPONSE}" | jq -r '.key // empty')
if [ -n "${TICKET_KEY}" ] && [ "${TICKET_KEY}" != "null" ]; then
  echo "Created Jira ticket: ${TICKET_KEY}."

  echo "Send Slack notification..."
  # Send Slack notification with link to Jira ticket for details
  SLACK_MESSAGE="Warning-level IPA violations found (${WARNING_COUNT} violations) (${SLACK_ONCALL_USER}).

See Jira ticket for details: https://jira.mongodb.org/browse/${TICKET_KEY}"

  SLACK_RESPONSE=$(curl -X POST -H "Authorization: Bearer ${SLACK_BEARER_TOKEN}" \
    -H "Content-type: application/json" \
    --data "{\"channel\":\"${SLACK_CHANNEL_ID}\",\"text\":\"${SLACK_MESSAGE}\"}" \
    https://slack.com/api/chat.postMessage)

  echo "Slack API response: ${SLACK_RESPONSE}"

  SLACK_OK=$(echo "${SLACK_RESPONSE}" | jq -r '.ok')
  if [ "${SLACK_OK}" != "true" ]; then
    SLACK_ERROR=$(echo "${SLACK_RESPONSE}" | jq -r '.error')
    echo "Warning: Failed to send Slack notification. Error: ${SLACK_ERROR}"

    if [ "${SLACK_ERROR}" == "not_in_channel" ]; then
      echo "The Slack bot is not a member of channel ${SLACK_CHANNEL_ID}."
      echo "Please invite the bot to the channel or update SLACK_CHANNEL_ID."
    fi

    # Don't fail the script - Jira ticket was created successfully
    echo "Continuing despite Slack notification failure..."
  else
    echo "Slack notification sent successfully."
  fi
else
  echo "Failed to create Jira ticket"
  echo "Response: ${TICKET_RESPONSE}"
  ERROR_MESSAGES=$(echo "${TICKET_RESPONSE}" | jq -r '.errorMessages[]? // .errors? // "No error details available"' 2>/dev/null || echo "Could not parse error response")
  echo "Error details: ${ERROR_MESSAGES}"
  exit 1
fi
