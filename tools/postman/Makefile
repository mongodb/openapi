export OPENAPI_FOLDER=./openapi
export TMP_FOLDER=./tmp

.PHONY: fetch_openapi
fetch_openapi:
	./scripts/fetch.sh

.PHONY: convert_collection
convert_collection:
	./scripts/convert-to-collection.sh

.PHONY: collection
collection: fetch_openapi convert_collection
