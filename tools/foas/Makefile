# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

GOLANGCI_VERSION=v2.15.0
TEST_CMD?=go test
COVERAGE=coverage.out

export GO111MODULE := on

.PHONY: deps
deps:  ## Download go module dependencies
	@echo "==> Installing go.mod dependencies..."
	go mod download
	go mod tidy

.PHONY: check-tidy
check-tidy: ## Fail if go.mod or go.sum is not tidy
	go mod tidy -diff

.PHONY: check-fix
check-fix: ## Fail if go fix would change any file
	go fix -diff ./...

.PHONY: devtools
devtools:  ## Install dev tools
	@echo "==> Installing dev tools..."
	go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_VERSION)

.PHONY: fmt
fmt: ## Format all go files with the formatters configured in .golangci.yml
	golangci-lint fmt

.PHONY: build
build: ## Build all packages in the library
	@echo "==> Building foas library"
	go build ./...

.PHONY: lint
lint: ## Run linter
	golangci-lint run

.PHONY: go-fix
go-fix: ## Apply go fix modernizations
	go fix ./...

.PHONY: fix-lint
fix-lint: go-fix ## Apply go fix, then fix linting errors
	golangci-lint run --fix

.PHONY: unit-test
unit-test: ## Run unit-tests
	@echo "==> Running unit tests..."
	$(TEST_CMD) -race -cover ./...