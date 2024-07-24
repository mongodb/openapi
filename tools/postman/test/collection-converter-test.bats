#!/usr/bin/env bats

# Setup that runs before all tests
setup_file() {
    # Define the environment varibales
    export OPENAPI_FILE_NAME=example-openapi-spec.json
    export COLLECTION_FILE_NAME=collection-output.json
    export OPENAPI_FOLDER=./test
    export TMP_FOLDER=./test
}

@test "Run converter and compare output with gold example file" {
    # Setup input and output files
    OUTPUT_FILE_NAME=collection-pretty.json
    GOLD_COLLECTION=gold-collection.json

    rm -f "$TMP_FOLDER"/"$COLLECTION_FILE_NAME"
    rm -f "$TMP_FOLDER"/"$OUTPUT_FILE_NAME"

    # Run script under test
    run bash ./scripts/convert-to-collection.sh
    # Check script exited with status 0
    [ "$status" -eq 0 ]

    # Split the output over multiple lines with pretty print make diff more granular
    jq '.' "$TMP_FOLDER"/"$COLLECTION_FILE_NAME" > "$TMP_FOLDER"/"$OUTPUT_FILE_NAME"

    # Check for differences between the output and the gold standard ignoring generated fields
    run bash -c "diff "$TMP_FOLDER"/"$OUTPUT_FILE_NAME" "$TMP_FOLDER"/"$GOLD_COLLECTION" | grep --invert-match -E '\"id\"|\"body\"|\"_postman_id\"'| grep -E '<|>'"
    
    # Check there has been no errors and the diff output is empty
    echo "status: "$status
    echo "output: "$output
    [ "$status" -lt 2 ]
    [ -z "$output" ]

    # Clean up
    rm -f "$TMP_FOLDER"/"$COLLECTION_FILE_NAME"
    rm -f "$TMP_FOLDER"/"$OUTPUT_FILE_NAME"
}
