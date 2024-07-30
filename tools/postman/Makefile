export OPENAPI_FOLDER=./openapi
export TMP_FOLDER=./tmp

default: build

.PHONY: fetch_openapi
fetch_openapi:
	./scripts/fetch-openapi.sh

.PHONY: fetch_forks
fetch_forks: 
	./scripts/fetch-forks.sh

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

.PHONY: compare_and_send_forks
compare_and_send_forks: 
	./scripts/send-fork-data.sh

.PHONY: clean
clean:
	rm ./openapi/*; rm ./tmp/*
