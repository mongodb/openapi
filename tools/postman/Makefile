export OPENAPI_FOLDER=./openapi
export TMP_FOLDER=./tmp

default: build

.PHONY: fetch_openapi
fetch_openapi:
	./scripts/fetch.sh

.PHONY: convert_to_collection
convert_to_collection:
	./scripts/convert-to-collection.sh

.PHONY: transform_collection
transform_collection:
	./scripts/transform-for-api.sh

.PHONY: upload_collection
upload_collection: transform_collection
	./scripts/upload-collection.sh

.PHONY: build
build: fetch_openapi convert_to_collection

.PHONY: build_and_upload
build_and_upload: build upload_collection

.PHONY: unit_tests
unit_tests:
	npm install;
	./node_modules/.bin/bats -x ./test/collection-converter-test.bats

.PHONY: clean
clean:
	rm ./openapi/*; rm ./tmp/*
