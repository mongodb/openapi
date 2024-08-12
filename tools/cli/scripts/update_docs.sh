#!/bin/bash

set -euxo pipefail

# Update the filters documentation

./scripts/doc_filters.sh > internal/openapi/filter/README.md

go fmt ./...

git add "internal/openapi/filter/README.md"