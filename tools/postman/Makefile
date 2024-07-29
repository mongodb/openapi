export OPENAPI_FOLDER=./openapi
export TMP_FOLDER=./tmp

default: build

.PHONY: fetch_openapi
fetch_openapi:
	./scripts/fetch.sh

.PHONY: fetch_forks
fetch_forks:
	# Implemented by CLOUDP-263846
	# ./scripts/fetch_forks.sh
	# Temporary Fake data for testing
	echo "{\"collections\": [{\"id\": \"289452fe-dfa8-4d06-b1ed-b0161391ae28\",\"name\": \"Collection 1\",\"forks\": \"4\"},{\"id\": \"8c788b23-6475-4f67-baa6-00b38f5832fd\",\"name\": \"Collection 2\",\"forks\": \"5\"},{\"id\": \"bed2c9e5-5a73-487a-aed5-ba1c46354c1b\",\"name\": \"Collection 3\",\"forks\": \"6\"}]}" > ./openapi/fork-data.json

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
