#!/bin/bash

set -euxo pipefail

# Update the filters documentation
./scripts/doc_filters.sh > internal/openapi/filter/README.md

go fmt ./...

if [ -n "$(git status --porcelain internal/openapi/filter/README.md)" ]; then
    git add "internal/openapi/filter/README.md"
fi