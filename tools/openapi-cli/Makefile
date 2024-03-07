# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

GOLANGCI_VERSION=v1.55.0
COVERAGE=coverage.out

SOURCE_FILES?=./cmd
BINARY_NAME=openapicli
VERSION=$(GITTAG:v%=%)
GIT_SHA?=$(shell git rev-parse HEAD)
DESTINATION=./bin/$(BINARY_NAME)

LINKER_FLAGS=-s -w -X github.com/mongodb/mongodb-atlas-cli/internal/version.GitCommit=${GIT_SHA}

DEBUG_FLAGS=all=-N -l

export PATH := $(shell go env GOPATH)/bin:$(PATH)
export PATH := ./bin:$(PATH)
export TERM := linux-m
export GO111MODULE := on

.PHONY: deps
deps:  ## Download go module dependencies
	@echo "==> Installing go.mod dependencies..."
	go mod download
	go mod tidy

.PHONY: setup
setup: deps ## Set up dev env

.PHONY: fmt-all
fmt-all: ### Format all go files with goimports and gofmt
	find . -name "*.go" -not -path "./vendor/*" -not -path "./internal/mocks" -exec gofmt -w "{}" \;
	find . -name "*.go" -not -path "./vendor/*" -not -path "./internal/mocks" -exec goimports -l -w "{}" \;

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
