#!/usr/bin/env bash
set -e

# Get the root directory of the project
ROOT_DIR=$(git rev-parse --show-toplevel)

# Change to the CLI directory where the Makefile is located
cd "$ROOT_DIR/tools/cli"

# Format Go files
echo "Formatting Go files..."
make fmt

# Run golangci-lint
echo "Running golangci-lint..."
make lint

# Run unit tests for Go files
echo "Running Go unit tests..."
make unit-test

# Return to the original directory
cd -

# Return 0 to indicate success
exit 0
