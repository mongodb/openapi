.PHONY: build
build: ## Build the MCP server binary
	@echo "==> Building mcp-server binary"
	go build -o bin/mcp-server ./cmd

.PHONY: install
install: ## Install the MCP server binary to GOPATH/bin
	@echo "==> Installing mcp-server"
	go install ./cmd

##@ Development

.PHONY: fmt
fmt: ## Format Go code
	@echo "==> Formatting code"
	gofmt -w -s .

.PHONY: lint
lint: ## Run linter
	@echo "==> Running linter"
	golangci-lint run

.PHONY: test
test: ## Run tests
	@echo "==> Running tests"
	go test -v ./...

##@ Cleanup

.PHONY: clean
clean: ## Remove build artifacts
	@echo "==> Cleaning build artifacts"
	rm -rf bin/

##@ Dependencies

.PHONY: deps
deps: ## Download dependencies
	@echo "==> Downloading dependencies"
	go mod download

.PHONY: tidy
tidy: ## Tidy go.mod
	@echo "==> Tidying go.mod"
	go mod tidy

