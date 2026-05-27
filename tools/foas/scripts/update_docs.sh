#!/bin/bash

set -euxo pipefail

# Update the filters documentation
./scripts/doc_filters.sh > openapi/filter/README.md

go fmt ./...

if [ -n "$(git status --porcelain openapi/filter/README.md)" ]; then
    git add "openapi/filter/README.md"
fi