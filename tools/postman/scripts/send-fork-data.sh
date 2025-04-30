#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Send the Fork metrics message to Slack
# Environment variables:
#   OPENAPI_FOLDER - folder for saving openapi file
#   MESSAGE_FILE - file where the message to send to Slack will be stored
#########################################################

OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
MESSAGE_FILE=${MESSAGE_FILE:-"message.json"}

pushd "${OPENAPI_FOLDER}"

echo "Sending update to Slack"
curl --show-error --retry 5 --fail --silent \
    --location "$SLACK_WEBHOOK_URL" \
    --header "Content-Type: application/json" \
    --data "@${MESSAGE_FILE}"

popd -0
