#!/bin/bash

# Notifies the APIx DevOps Integrations help usergroup when the Go SDK
# validation step fails during an OpenAPI spec release.
#
# The caller keys this notification to the "go-sdk-validation" step outcome, so
# a failure in an earlier setup step (Node, npm, artifact download, Spectral,
# Go) does not notify. The caller also suppresses duplicates across release
# retries.

set -eou pipefail

: "${SLACK_BEARER_TOKEN:?SLACK_BEARER_TOKEN is required}"
: "${SLACK_CHANNEL_ID:?SLACK_CHANNEL_ID is required}"
: "${SLACK_HELP_GROUP:?SLACK_HELP_GROUP is required}"
: "${TARGET_ENV:?TARGET_ENV is required}"
: "${RUN_URL:?RUN_URL is required}"

SLACK_MESSAGE=$(
  cat <<EOF
:rotating_light: The Go SDK validation step failed while validating the OpenAPI spec for the ${TARGET_ENV} environment.
${SLACK_HELP_GROUP} can you take a look? This can be caused by the input spec or by the atlas-sdk-go tooling, so please triage before assuming a root cause.
Run: ${RUN_URL}
EOF
)

PAYLOAD=$(jq -n \
  --arg channel "${SLACK_CHANNEL_ID}" \
  --arg text "${SLACK_MESSAGE}" \
  '{channel: $channel, text: $text}')

SLACK_RESPONSE=$(curl --silent --show-error \
  --request POST \
  --header "Authorization: Bearer ${SLACK_BEARER_TOKEN}" \
  --header "Content-type: application/json; charset=utf-8" \
  --data "${PAYLOAD}" \
  https://slack.com/api/chat.postMessage)

SLACK_OK=$(echo "${SLACK_RESPONSE}" | jq -r '.ok')
if [ "${SLACK_OK}" != "true" ]; then
  SLACK_ERROR=$(echo "${SLACK_RESPONSE}" | jq -r '.error')
  echo "Failed to send the Slack notification: ${SLACK_ERROR}"
  if [ "${SLACK_ERROR}" == "not_in_channel" ]; then
    echo "The Slack bot is not a member of channel ${SLACK_CHANNEL_ID}."
    echo "Invite the bot to the channel or update SLACK_CHANNEL_ID."
  fi
  exit 1
fi

echo "Slack notification sent to ${SLACK_CHANNEL_ID}."
