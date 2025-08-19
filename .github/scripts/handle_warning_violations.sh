#!/bin/bash
set -eou pipefail

WARNING_COUNT=$1
TEAM_ID=$2
JIRA_API_TOKEN=$3
SLACK_BEARER_TOKEN=$4
SLACK_CHANNEL_ID=$5
DRY_RUN=${6:-false}  # Optional 6th parameter for dry run

if [ "$WARNING_COUNT" -eq 0 ]; then
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

if [ "$DRY_RUN" = "true" ]; then
  echo "=== DRY RUN MODE ==="
  echo "Would create Jira ticket with:"
  echo "Summary: Warning-level IPA violations found - $WARNING_COUNT violations"
  echo "Description:"
  echo "Warning-level violations were found during IPA validation.

Violation Summary:
$VIOLATION_DETAILS

Total violations: $WARNING_COUNT"
  echo ""
  echo "Would send Slack message:"
  SLACK_SUMMARY=$(echo "$VIOLATION_DETAILS" | head -3)
  if [ $(echo "$VIOLATION_DETAILS" | wc -l) -gt 3 ]; then
    SLACK_SUMMARY="$SLACK_SUMMARY\n... and more"
  fi
  echo "Warning-level IPA violations found ($WARNING_COUNT violations). 

Top violations:
$SLACK_SUMMARY

Jira ticket: [DRY RUN - no ticket created]"
  exit 0
fi

# Check if warning ticket already exists
EXISTING_TICKET=$(curl -s -H "Authorization: Bearer $JIRA_API_TOKEN" \
  "https://jira.mongodb.org/rest/api/2/search?jql=project=CLOUDP AND summary~'Warning-level IPA violations' AND status!=Done" \
  | jq -r '.issues[0].key // empty')

if [ -n "$EXISTING_TICKET" ]; then
  echo "Warning ticket already exists: $EXISTING_TICKET"
  exit 0
fi

# Create detailed description
DESCRIPTION="Warning-level violations were found during IPA validation. Please review and add exceptions if valid, or address false positives.

Violation Summary:
$VIOLATION_DETAILS

Total violations: $WARNING_COUNT"

# Create new Jira ticket
TICKET_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"fields\": {
      \"project\": {\"key\": \"CLOUDP\"},
      \"summary\": \"Warning-level IPA violations found - $WARNING_COUNT violations\",
      \"description\": \"$DESCRIPTION\",
      \"issuetype\": {\"name\": \"Task\"},
      \"assignee\": {\"id\": \"$TEAM_ID\"}
    }
  }" \
  "https://jira.mongodb.org/rest/api/2/issue/")

TICKET_KEY=$(echo "$TICKET_RESPONSE" | jq -r '.key')

if [ "$TICKET_KEY" != "null" ]; then
  echo "Created Jira ticket: $TICKET_KEY"
  
  # Create summary for Slack
  SLACK_SUMMARY=""
  if [ -n "$VIOLATION_DETAILS" ]; then
    SLACK_SUMMARY=$(echo "$VIOLATION_DETAILS" | head -3)
    if [ $(echo "$VIOLATION_DETAILS" | wc -l) -gt 3 ]; then
      SLACK_SUMMARY="$SLACK_SUMMARY\n... and more"
    fi
  fi
  
  # Send Slack notification with violation summary
  SLACK_MESSAGE="Warning-level IPA violations found ($WARNING_COUNT violations). 

Top violations:
$SLACK_SUMMARY

Jira ticket: https://jira.mongodb.org/browse/$TICKET_KEY"
  
  curl -X POST -H "Authorization: Bearer $SLACK_BEARER_TOKEN" \
    -H "Content-type: application/json" \
    --data "{\"channel\":\"$SLACK_CHANNEL_ID\",\"text\":\"$SLACK_MESSAGE\"}" \
    https://slack.com/api/chat.postMessage
else
  echo "Failed to create Jira ticket"
  exit 1
fi