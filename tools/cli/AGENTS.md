# AGENTS.md: foascli

`foascli` is the Go CLI that generates the Federated OpenAPI specification and the API changelog.
See [README.md](README.md) for what it does and [CONTRIBUTING.md](../../CONTRIBUTING.md) for the
project-wide rules. This file covers the development loop.

## Layout

- `cmd/`: the `foascli` entry point.
- `internal/cli/`: one package per command (`merge`, `split`, `slice`, `filter`, `versions`,
  `changelog`, `breakingchanges`, `sunset`, ...). Command wiring lives in `internal/cli/root`.
- `test/e2e/`: end-to-end tests that run the built binary. Fixtures are in `test/data/`.
- Most OpenAPI logic lives in the sibling module `../foas` (`github.com/mongodb/openapi/tools/foas`),
  which this module consumes through `replace ... => ../foas`. Both modules belong to the Go workspace
  in `../go.work`. A change in `foas` can break `foascli`, so after changing `foas`, also run the loop
  below here.

## Setup

Run all commands from `tools/cli`.

```shell
make setup   # go mod download + go mod tidy, then install mockgen, oasdiff and golangci-lint
```

The tools are installed to `$(go env GOPATH)/bin`, which must be on your `PATH`.

## Development loop

1. Make the change.
2. `make fmt`: run `golangci-lint fmt`, which applies the formatters configured in `.golangci.yml`
   (`gci`, `gofmt`, `goimports`). `make lint` also reports unformatted files.
3. `make fix-lint`: run golangci-lint (config in `.golangci.yml`) and apply the automatic fixes it can.
   Fix whatever remains by hand. `make lint` runs the same checks without changing files.
4. `make unit-test`: run `go test -race -cover ./internal...`.
5. `make e2e-test`: build the binary into `./bin/foascli` and run `./test/e2e...` against it. Run this
   when you change command behavior or output.
6. `make check-tidy`: fail if `go.mod` or `go.sum` is not tidy. Run it after changing dependencies.

`make pre-commit` runs steps 2 to 4. The repository's git pre-commit hook runs it for staged Go files.

CI (`.github/workflows/code-health-foascli.yml`) runs the build, unit tests, golangci-lint, `make check-tidy`,
actionlint and the e2e tests.

## Gotchas

- Run e2e tests with `make e2e-test`, not `go test ./...`. The tests find the binary through
  `CLI_E2E_BINARY`, which the Makefile sets. Without it they fail with `fork/exec ...: permission denied`.
- After editing `tools/spectral/ipa/rulesets/functions/utils/legacyLroOperationIds.js`, run
  `go generate ./...` to regenerate the Go copy. A unit test fails if it is out of date.
- `make gen-mocks` regenerates mocks with `go generate ./internal...`.
- Dependabot bumps each module separately. A bump in `foas` can leave this module's `go.mod` untidy.
  `make check-tidy` catches that, and `go mod tidy` fixes it.
- Running Go commands in the workspace can add lines to `../go.work.sum`. Don't commit those unless
  the change needs them.
- To bump golangci-lint, follow [docs/update-golangci-lint.md](../../docs/update-golangci-lint.md).

## Conventions

- Tests are table-driven and use `testify` (`assert`/`require`). New tests call `t.Parallel()` in the
  test and in each subtest, unless they share state.
- When you must suppress a linter, scope `//nolint:<linter> // <reason>` to the line.
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) in PR titles.
- Always open PRs as drafts (`gh pr create --draft`). Mark them ready for review once CI passes.
- Releases are covered in [RELEASING.md](RELEASING.md).
