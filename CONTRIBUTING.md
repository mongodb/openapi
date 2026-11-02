# Contributing to MongoDB OpenAPI Project

## Development Setup

### Prerequisites

- Node.js v20 or later
- npm v8 or later
- Git
- Go 1.21 or later (for CLI development)

### Installation

1. Clone the repository (see [Cloning the repository](#cloning-the-repository) for why we use a filtered clone):
   ```bash
   git clone --filter=blob:none https://github.com/mongodb/openapi.git
   cd openapi
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

### Cloning the repository

The repository history is large (about 8.4 GiB). The release workflows regularly commit regenerated multi-MB OpenAPI specs under `openapi/`, so history holds hundreds of thousands of versions of those files. The files you check out are only about 490 MB, so a full clone mostly downloads history you rarely need.

Measured clone times for `main`:

| Strategy | Command | Time | `.git` size |
|---|---|---|---|
| Shallow | `git clone --depth=1 --single-branch --no-tags <url>` | ~16s | ~10 MB |
| Treeless | `git clone --filter=tree:0 <url>` | ~26s | ~17 MB |
| **Blobless (recommended)** | `git clone --filter=blob:none <url>` | ~31s | ~36 MB |
| Full | `git clone <url>` | ~530s | ~8.4 GiB |

Times were taken on a single machine and vary with network speed.

- **Blobless (recommended for development)** keeps the full commit history, so `git log`, `git blame` and branching work normally. File contents of old revisions are downloaded on demand, so commands like `git checkout <old-sha>` or `git log -p` on a spec file may pause to fetch them.
- **Shallow** is the fastest option and suits one-off changes and CI, but history-based commands are limited. Run `git fetch --unshallow` to get the full history later.
- **Treeless** is the smallest filtered clone, but many later git operations need to fetch trees on demand and are slower. Prefer it only for throwaway or CI use.
- To reduce the working tree as well, add `--sparse` and select the directories you need, for example `git sparse-checkout set tools/cli`.

In GitHub Actions, `actions/checkout` already does a blobless fetch whenever `sparse-checkout` is set, and otherwise defaults to `fetch-depth: 1`. Avoid `fetch-depth: 0` without `sparse-checkout`, because it downloads the entire 8.4 GiB history.

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
- `go generate ./...` - Regenerate the Go copy of the legacy long-running operation list. Run
  this after editing `tools/spectral/ipa/rulesets/functions/utils/legacyLroOperationIds.js`; a
  unit test fails if the generated copy is out of date, so a forgotten run cannot pass CI

**Note: Please ensure the usage of [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) in PR titles**