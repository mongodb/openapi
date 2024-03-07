# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

SOURCE_FILES?=./cmd
BINARY_NAME=openapicli
VERSION=v0.0.1
GIT_SHA?=$(shell git rev-parse HEAD)
DESTINATION=./bin/$(BINARY_NAME)

LINKER_GH_SHA_FLAG=-s -w -X github.com/mongodb/openapi/tools/cli/internal/version.GitCommit=${GIT_SHA}
LINKER_FLAGS=${LINKER_GH_SHA_FLAG} -X github.com/mongodb/openapi/tools/cli/internal/version.Version=${VERSION}

DEBUG_FLAGS=all=-N -l

export TERM := linux-m
export GO111MODULE := on

.PHONY: deps
deps:  ## Download go module dependencies
	@echo "==> Installing go.mod dependencies..."
	go mod download
	go mod tidy

.PHONY: setup
setup: deps ## Set up dev env

.PHONY: fmt
fmt: ### Format all go files with goimports and gofmt
	find . -name "*.go" -exec gofmt -w "{}" \;
	find . -name "*.go" -exec goimports -l -w "{}" \;

.PHONY: build
build:
	@echo "==> Building openapicli binary"
	go build -ldflags "$(LINKER_FLAGS)" -o $(DESTINATION) $(SOURCE_FILES)


.PHONY: build-debug
build-debug:
	@echo "==> Building openapicli binary for debugging"
	go build -gcflags="$(DEBUG_FLAGS)" -ldflags "$(LINKER_FLAGS)" -o $(DESTINATION) $(SOURCE_FILES)


.PHONY: list
list: ## List all make targets
	@${MAKE} -pRrn : -f $(MAKEFILE_LIST) 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | sort


.PHONY: help
.DEFAULT_GOAL := help
help:
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
