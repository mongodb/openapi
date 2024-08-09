#!/usr/bin/env bash
set -euo pipefail

#########################################################
# Compare number of forks for each collection to the previous week
# Environment variables:
#   OPENAPI_FOLDER - folder for saving openapi file
#   FORKS_DATA_FILE - file containing a list fork metrics for each collection
#   PREVIOUS_FORKS_DATA_FILE - file containing the previous fork metrics
#   MESSAGE_FILE - file where the message to send to Slack will be stored
#########################################################

OPENAPI_FOLDER=${OPENAPI_FOLDER:-"../openapi"}
FORKS_DATA_FILE=${FORKS_DATA_FILE:-"fork-data.json"}
PREV_FORKS_DATA_FILE=${PREV_FORKS_DATA_FILE:-"previous-fork-data.json"}
MESSAGE_FILE=${MESSAGE_FILE:-"message.json"}

pushd "${OPENAPI_FOLDER}"

collection_ids=$(jq -r '.collections[].id' "$FORKS_DATA_FILE")

message=""

echo "Comparing fork data"
for collection_id in $collection_ids; do
    collection_name=$(jq -r --arg id "$collection_id" '.collections[] | select(.id==$id) | .name' "$FORKS_DATA_FILE")

    current_forks=$(jq -r --arg id "$collection_id" '.collections[] | select(.id==$id) | .forks' "$FORKS_DATA_FILE")

    if [ -f "$PREV_FORKS_DATA_FILE" ]; then
        previous_forks=$(jq -r --arg id "$collection_id" '.collections[] | select(.id==$id) | .forks' "$PREV_FORKS_DATA_FILE")
        if [[ ! $previous_forks ]]; then
            previous_forks=0
        fi
    else
        previous_forks=0
    fi

    difference=$((current_forks - previous_forks))

    message+=$'\n\n'"$collection_name currently has a total of $current_forks forks. That is a difference of $difference from the last update"
done

jq -n --arg message "$message" '{updates: $message}' > "$MESSAGE_FILE"

popd -0
