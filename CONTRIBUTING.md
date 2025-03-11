# Contributing to MongoDB OpenAPI Project

## Development Setup

### Prerequisites

- Node.js v20 or later
- npm v8 or later
- Git

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

3. Set up Git hooks (optional):
   ```bash
   npm run precommit
   ```

This will install Husky, which manages Git hooks for the project. The hooks ensure code quality by automatically running various checks before commits.

## Development Workflow

### Git Hooks

This project uses the following Git hooks:

- **pre-commit**: Automatically formats your code using Prettier and runs tests for staged JavaScript files to ensure code quality before each commit.
  - If you get the message `hint: The '.husky/pre-commit' hook was ignored because it's not set as executable.` during the commit, you can run `chmod ug+x .husky/*` to make it executable.

### Available Scripts

- `npm run format` - Format all files with Prettier
- `npm run format-check` - Check formatting without modifying files
- `npm run lint-js` - Lint JavaScript files
- `npm run test` - Run all tests

#### IPA specific targets

- `npm run gen-ipa-docs` - Generate IPA ruleset documentation (see `./tools` folder for more information)
- `npm run ipa-validation` - Run OpenAPI validation with Spectral
