# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

GOLANGCI_VERSION=v2.10.1
TEST_CMD?=go test
COVERAGE=coverage.out

export GO111MODULE := on

.PHONY: deps
deps:  ## Download go module dependencies
	@echo "==> Installing go.mod dependencies..."
	go mod download
	go mod tidy

.PHONY: devtools
devtools:  ## Install dev tools
	@echo "==> Installing dev tools..."
	go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_VERSION)

.PHONY: fmt
fmt: ### Format all go files with goimports and gofmt
	find . -name "*.go" -exec gofmt -w "{}" \;
	find . -name "*.go" -exec goimports -l -w "{}" \;

.PHONY: build
build: ## Build all packages in the library
	@echo "==> Building foas library"
	go build ./...

.PHONY: lint
lint: ## Run linter
	golangci-lint run

.PHONY: unit-test
unit-test: ## Run unit-tests
	@echo "==> Running unit tests..."
	$(TEST_CMD) -race -cover ./...