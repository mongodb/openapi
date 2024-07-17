export OPENAPI_FOLDER=./openapi
export TMP_FOLDER=./tmp

default: build

.PHONY: fetch_openapi
fetch_openapi:
	./scripts/fetch.sh

.PHONY: convert_collection
convert_collection:
	./scripts/convert-to-collection.sh

.PHONY: build
build: fetch_openapi convert_collection
