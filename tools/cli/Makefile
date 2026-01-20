# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

GOLANGCI_VERSION=v2.1.0
SOURCE_FILES?=./cmd
BINARY_NAME=foascli
VERSION=v0.0.1
GIT_SHA?=$(shell git rev-parse HEAD)
DESTINATION=./bin/$(BINARY_NAME)

# e2e tests
CLI_E2E_BINARY?=../../../bin/${BINARY_NAME}
E2E_TIMEOUT?=60m
E2E_PARALLEL?=1
E2E_EXTRA_ARGS?=

LINKER_GH_SHA_FLAG=-s -w -X github.com/mongodb/openapi/tools/cli/internal/version.GitCommit=${GIT_SHA}
LINKER_FLAGS=${LINKER_GH_SHA_FLAG} -X github.com/mongodb/openapi/tools/cli/internal/version.Version=${VERSION}

DEBUG_FLAGS=all=-N -l
TEST_CMD?=go test
COVERAGE=coverage.out

export TERM := linux-m
export GO111MODULE := on
export CLI_E2E_BINARY

.PHONY: deps
deps:  ## Download go module dependencies
	@echo "==> Installing go.mod dependencies..."
	go mod download
	go mod tidy

.PHONY: devtools
devtools:  ## Install dev tools
	@echo "==> Installing dev tools..."
	go install go.uber.org/mock/mockgen@latest
	go install github.com/oasdiff/oasdiff@v1.11.4
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(shell go env GOPATH)/bin $(GOLANGCI_VERSION)

.PHONY: setup
setup: deps devtools ## Set up dev env

.PHONY: fmt
fmt: ### Format all go files with goimports and gofmt
	find . -name "*.go" -exec gofmt -w "{}" \;
	find . -name "*.go" -exec goimports -l -w "{}" \;

.PHONY: build
build:
	@echo "==> Building foascli binary"
	go build -ldflags "$(LINKER_FLAGS)" -o $(DESTINATION) $(SOURCE_FILES)


.PHONY: build-debug
build-debug:
	@echo "==> Building foascli binary for debugging"
	go build -gcflags="$(DEBUG_FLAGS)" -ldflags "$(LINKER_FLAGS)" -o $(DESTINATION) $(SOURCE_FILES)

.PHONY: lint
lint: ## Run linter
	$(shell go env GOPATH)/bin/golangci-lint run

.PHONY: fix-lint
fix-lint: ## Fix linting errors
	$(shell go env GOPATH)/bin/golangci-lint run --fix

.PHONY: list
list: ## List all make targets
	@${MAKE} -pRrn : -f $(MAKEFILE_LIST) 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | sort

.PHONY: e2e-test
e2e-test: build ## Run E2E tests
	@echo "==> Running E2E tests..."
	rm -rf test/e2e/cli/output
	$(TEST_CMD) -v -p 1 -parallel $(E2E_PARALLEL) -timeout $(E2E_TIMEOUT)  ./test/e2e... $(E2E_EXTRA_ARGS)

.PHONY: gen-docs
gen-docs: ## Generate docs
	@echo "==> Updating docs"
	./scripts/update_docs.sh

.PHONY: unit-test
unit-test: ## Run unit-tests
	@echo "==> Running unit tests..."
	$(TEST_CMD) -race -cover ./internal...

.PHONY: gen-mocks
gen-mocks: ## Generate mocks
	@echo "==> Generating mocks"
	go generate ./internal...

.PHONY: pre-commit
pre-commit: fmt lint unit-test ## Run pre-commit checks

.PHONY: help
.DEFAULT_GOAL := help
help:
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
