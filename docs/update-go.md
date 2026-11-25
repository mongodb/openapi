# Updating Go

This guide explains how the Go version is pinned for the Go modules in this repository
(`tools/cli` and `tools/foas`) and how to update it.

## Where the version is pinned

The `go.mod` files are the single source of truth. Each file has two directives, and both must
match across all three files:

| File | Directives |
| --- | --- |
| `tools/cli/go.mod` | `go`, `toolchain` |
| `tools/foas/go.mod` | `go`, `toolchain` |
| `tools/go.work` | `go`, `toolchain` |

- `go` is the language version, for example `go 1.27.0`. It sets which language features and
  `go fix` modernizations apply. Change it only when moving to a new minor release.
- `toolchain` is the exact Go release that builds and tests the code, for example `toolchain go1.27.4`.
  Bump it for every patch release, which often carries security fixes.

`tools/go.work` needs the same directives because Go commands run in workspace mode inside `tools/`,
and in that mode Go reads the version from `go.work` instead of `go.mod`.

## How each environment picks the version

- **GitHub Actions:** every workflow installs Go with `actions/setup-go` and
  `go-version-file: tools/<module>/go.mod`. When a `toolchain` directive is present, `setup-go`
  installs that version.
- **Locally:** with the default `GOTOOLCHAIN=auto`, any Go 1.21 or newer downloads and runs the
  `toolchain` version automatically. You don't need to install that exact release.

Don't pin Go anywhere else, such as in `.tool-versions` or a workflow's `go-version`.

## Steps

1. Find the latest release on the [Go downloads page](https://go.dev/dl/).
2. Update the toolchain, and for a new minor release also the language version:

   ```shell
   cd tools/cli && go mod edit -go=1.27.0 -toolchain=go1.27.4
   cd ../foas && go mod edit -go=1.27.0 -toolchain=go1.27.4
   cd .. && go work edit -go=1.27.0 -toolchain=go1.27.4
   ```

3. In each module, run:

   ```shell
   make check-tidy   # if it fails, run go mod tidy
   make fix-lint     # applies go fix, which may modernize code for a new language version
   make unit-test
   ```

   In `tools/cli`, also run `make e2e-test`.
4. For a new minor release, check that the pinned golangci-lint was built with a Go version at least
   as new as the `go` directive (`golangci-lint version` prints it). If it wasn't, update golangci-lint
   first, following [update-golangci-lint.md](update-golangci-lint.md).
5. Open a PR with a conventional commit title, for example `chore: update Go to 1.27.4`.
