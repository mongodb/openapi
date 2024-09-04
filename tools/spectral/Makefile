# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

SPECTRAL_VERSION=${SPECTRAL_VERSION:-6.11.1}

.PHONY: deps
deps:  ## Download go module dependencies
	@echo "==> Installing npx..."
	npm install -g npx


.PHONY: devtools
devtools:  ## Install dev tools
	@echo "==> Installing dev tools..."
	npm install -g @stoplight/spectral-cli@"${SPECTRAL_VERSION}"

.PHONY: setup
setup: deps devtools ## Set up dev env

.PHONY: linterr
linterr: ## Run spectral linter on foas
	@echo "==> Running spectral linter"
	npx -- @stoplight/spectral-cli@"${SPECTRAL_VERSION}" lint ../../openapi/v2.yaml --ruleset=.spectral.yaml

.PHONY: lintwarn
lintwarn: ## Run spectral linter on foas
	@echo "==> Running spectral linter"
	npx -- @stoplight/spectral-cli@"${SPECTRAL_VERSION}" lint ../../openapi/v2.yaml --ruleset=.spectral.yaml --fail-severity=warn

.PHONY: help
.DEFAULT_GOAL := help
help:
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
