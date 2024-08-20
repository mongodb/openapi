export OPENAPI_FOLDER=./openapi
export TMP_FOLDER=./tmp
export FULL_OPENAPI_FOLDER=../../openapi/v2/

default: build

.PHONY: fetch_openapi
fetch_openapi:
	./scripts/fetch-openapi.sh

.PHONY: convert_to_collection
convert_to_collection:
	./scripts/convert-to-collection.sh

.PHONY: transform_collection
transform_collection:
	./scripts/transform-for-api.sh

.PHONY: upload_collection
upload_collection:
	./scripts/upload-collection.sh

.PHONY: build
build: fetch_openapi convert_to_collection

.PHONY: build_and_upload
build_and_upload: build transform_collection upload_collection

.PHONY: fetch_forks
fetch_forks: 
	./scripts/fetch-forks.sh

.PHONY: compare_forks
compare_forks: 
	./scripts/compare-forks.sh

.PHONY: send_forks
send_forks: 
	./scripts/send-fork-data.sh

.PHONY: compare_and_send_forks
compare_and_send_forks: compare_forks send_forks

.PHONY: clean
clean:
	rm ./openapi/*; rm ./tmp/*
