#!/usr/bin/env bats

# Setup function to run before each test
setup() {
    # Define the environment varibales
    export OPENAPI_FILE_NAME=example-openapi-spec.json
    export COLLECTION_FILE_NAME=collection-output.json
    export OPENAPI_FOLDER=./test
    export TMP_FOLDER=./test

    OUTPUT_FILE_NAME=collection-pretty.json
    GOLD_COLLECTION=gold-collection.json

    # Ensure output file does not exist before test
    rm -f "$TMP_FOLDER"/"$COLLECTION_FILE_NAME"
    rm -f "$TMP_FOLDER"/"$OUTPUT_FILE_NAME"
}

# Teardown function to run after each test
teardown() {
    rm -f "$TMP_FOLDER"/"$COLLECTION_FILE_NAME"
    rm -f "$TMP_FOLDER"/"$OUTPUT_FILE_NAME"
}

@test "Run converter and compare output with gold example file" {

    run bash ./scripts/convert-to-collection.sh
    # Check that the script exited with status 0
    [ "$status" -eq 0 ]

    # Split the output over multiple lines with pretty print make diff more granular
    jq '.' "$TMP_FOLDER"/"$COLLECTION_FILE_NAME" > "$TMP_FOLDER"/"$OUTPUT_FILE_NAME"

    # Check there is no difference between the output and the gold standard
    run bash -c "diff "$TMP_FOLDER"/"$OUTPUT_FILE_NAME" "$TMP_FOLDER"/"$GOLD_COLLECTION" | grep --invert-match -E '\"id\"|\"body\"|\"_postman_id\"'| grep -E '<|>'"
    
    # No errors
    echo "status: "$status
    [ "$status" -lt 2 ]

    # Empty difference
    echo "output: "$output
    [ -z "$output" ]

}
