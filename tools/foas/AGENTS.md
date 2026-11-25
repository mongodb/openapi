# AGENTS.md: foas

`foas` (`github.com/mongodb/openapi/tools/foas`) is the Go library behind `foascli`. It covers
OpenAPI loading, merging, filtering, slicing, versioning, sunsets, breaking-change exemptions and the
API changelog. See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the project-wide rules and
[../cli/README.md](../cli/README.md) for the CLI. This file covers the development loop.

## Layout

- `openapi/`: spec loading, merging, oasdiff integration, plus `filter/`, `slice/`, `sunset/` and
  `errors/`.
- `changelog/`: changelog generation, merge, manual entries and sunsets.
- `apiversion/`: API versions and stability levels.
- `breakingchanges/`: breaking-change exemptions.
- `test/data/`: test fixtures.

`foascli` (`../cli`) consumes this module through `replace ... => ../foas`, and both modules belong
to the Go workspace in `../go.work`. A change here can break the CLI, so after changing this module,
also run the CLI loop in [../cli/AGENTS.md](../cli/AGENTS.md).

## Setup

Run all commands from `tools/foas`.

```shell
make deps       # go mod download + go mod tidy
make devtools   # install golangci-lint
```

The tools are installed to `$(go env GOPATH)/bin`, which must be on your `PATH`. Regenerating mocks
needs `mockgen`, which this Makefile does not install (`go install go.uber.org/mock/mockgen@latest`).

## Development loop

1. Make the change.
2. `make fmt`: run `golangci-lint fmt`, which applies the formatters configured in `.golangci.yml`
   (`gci`, `gofmt`, `goimports`). `make lint` also reports unformatted files.
3. `make fix-lint`: apply the automatic fixes. It runs `make go-fix` (`go fix ./...`, which modernizes
   code to the Go version in `go.mod`), then golangci-lint with `--fix` (config in `.golangci.yml`).
   Fix whatever remains by hand. `make lint` runs the same lint checks without changing files.
4. `make unit-test`: run `go test -race -cover ./...`.
5. `make check-tidy`: fail if `go.mod` or `go.sum` is not tidy. Run it after changing dependencies.
6. `make check-fix`: fail if `go fix` would change any file. `make go-fix` or `make fix-lint` applies
   the fixes.
7. Run the CLI loop in `../cli`, at least `make unit-test` and `make e2e-test`.

`make build` compiles every package (`go build ./...`). There is no binary.

CI (`.github/workflows/code-health-foas-lib.yml`) runs the build, unit tests, golangci-lint,
`make check-tidy` and `make check-fix`.

## Gotchas

- Mocks (`openapi/mock_*.go`, `openapi/filter/mock_filter.go`) are generated with `mockgen` through
  `//go:generate` directives. After changing a mocked interface, regenerate them with
  `go generate ./...`.
- `openapi/filter/README.md` documents the filters. Update it when you add or change a filter.
- Dependabot bumps each module separately. A bump here can leave `../cli/go.mod` untidy. Run
  `make check-tidy` in `../cli` too.
- Running Go commands in the workspace can add lines to `../go.work.sum`. Don't commit those unless
  the change needs them.
- To bump golangci-lint, follow [docs/update-golangci-lint.md](../../docs/update-golangci-lint.md).

## Conventions

- Tests are table-driven and use `testify` (`assert`/`require`). New tests call `t.Parallel()` in the
  test and in each subtest, unless they share state.
- When you must suppress a linter, scope `//nolint:<linter> // <reason>` to the line.
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) in PR titles.
- Always open PRs as drafts (`gh pr create --draft`). Mark them ready for review once CI passes.
