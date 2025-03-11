# Contributing to MongoDB OpenAPI Project

## Development Setup

### Prerequisites

- Node.js v20 or later
- npm v8 or later
- Git
- Go 1.21 or later (for CLI development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mongodb-openapi.git
   cd mongodb-openapi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Git hooks (recommended):
   ```bash
   npm run precommit
   ```

4. If working on the Go CLI, set up the Go environment:
   ```bash
   cd tools/cli
   make setup
   ```

This will install Husky, which manages Git hooks for the project. The hooks ensure code quality by automatically running various checks before commits.

## Development Workflow

### Git Hooks

This project uses the following Git hooks:

- **pre-commit**: 
  - Automatically formats your code using Prettier and runs tests for staged JavaScript files 
  - If you get the message `hint: The '.husky/pre-commit' hook was ignored because it's not set as executable.` during the commit, you can run `chmod ug+x .husky/*` to make it executable.
  - For Go files, runs formatting, linting, and tests using the project's Makefile

### Available Scripts

#### JavaScript/Node.js
- `npm run format` - Format all files with Prettier
- `npm run format-check` - Check formatting without modifying files
- `npm run lint-js` - Lint JavaScript files
- `npm run test` - Run all tests

#### IPA specific targets
- `npm run gen-ipa-docs` - Generate IPA ruleset documentation (see `./tools` folder for more information)
- `npm run ipa-validation` - Run OpenAPI validation with Spectral

#### Go OpenAPI CLI (internal) 
When working in the `tools/cli` directory:
- `make fmt` - Format Go code
- `make lint` - Run golangci-lint
- `make unit-test` - Run Go unit tests
- `make e2e-test` - Run end-to-end tests
- `make build` - Build the CLI binary
- `make gen-docs` - Generate CLI documentation
