#!/usr/bin/env bash
set -e

# Get the root directory of the project
ROOT_DIR=$(git rev-parse --show-toplevel)

pushd "$ROOT_DIR/tools/cli"
make pre-commit
popd

exit 0
