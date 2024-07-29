#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

#########################################################
# Compare number of forks for each collection to the previous week
# Environment variables:
#   OPENAPI_FOLDER - folder for saving openapi file
#   FORKS_DATA_FILE - file containing a list fork metrics for each collection
#   PREVIOUS_FORKS_DATA_FILE - file containing the previous fork metrics
#########################################################

OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
FORKS_DATA_FILE=${FORKS_DATA_FILE:-"fork-data.json"}
PREV_FORKS_DATA_FILE=${PREV_FORKS_DATA_FILE:-"previous-fork-data.json"}

pushd "${OPENAPI_FOLDER}"

collection_ids=$(jq -r '.collections[].id' "$FORKS_DATA_FILE")

message=""

echo "Comparing fork data"
for collection_id in $collection_ids; do
    collection_name=$(jq -r --arg id $collection_id '.collections[] | select(.id==$id) | .name' $FORKS_DATA_FILE)

    current_forks=$(jq -r --arg id $collection_id '.collections[] | select(.id==$id) | .forks' $FORKS_DATA_FILE)
    previous_forks=$(jq -r --arg id $collection_id '.collections[] | select(.id==$id) | .forks' $PREV_FORKS_DATA_FILE)
    if [[ ! $previous_forks ]]; then
        previous_forks=0
    fi
    difference=$(($current_forks - $previous_forks))

    message+=$'\n\n'"$collection_name currently has a total of $current_forks forks. That is a difference of $difference from last week"
done

message_json=$(jq -n --arg message "$message" '{updates: $message}')

echo "Sending update to Slack"
curl --show-error --fail --silent \
    --location "$SLACK_WEBHOOK_URL" \
    --header "Content-Type: application/json" \
    --data "$message_json"

popd -0
