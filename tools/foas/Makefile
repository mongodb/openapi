# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

GOLANGCI_VERSION=v2.10.1
TEST_CMD?=go test
COVERAGE=coverage.out

export TERM := linux-m
export GO111MODULE := on

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
build: ## Build the library packages
	@echo "==> Building foas library"
	go build ./...

.PHONY: lint
lint: ## Run linter
	golangci-lint run

.PHONY: fix-lint
fix-lint: ## Fix linting errors
	golangci-lint run --fix

.PHONY: list
list: ## List all make targets
	@${MAKE} -pRrn : -f $(MAKEFILE_LIST) 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | sort

.PHONY: gen-docs
gen-docs: ## Generate docs
	@echo "==> Updating docs"
	./scripts/update_docs.sh

.PHONY: unit-test
unit-test: ## Run unit-tests
	@echo "==> Running unit tests..."
	$(TEST_CMD) -race -cover ./...

.PHONY: test
test: unit-test ## Alias for unit-test

.PHONY: gen-mocks
gen-mocks: ## Generate mocks
	@echo "==> Generating mocks"
	go generate ./...

.PHONY: pre-commit
pre-commit: fmt lint unit-test ## Run pre-commit checks

.PHONY: help
.DEFAULT_GOAL := help
help:
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
