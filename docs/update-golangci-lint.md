# Updating golangci-lint

This guide explains how to bump the [golangci-lint](https://github.com/golangci/golangci-lint)
version used by the Go modules in this repository (`tools/cli` and `tools/foas`).

## Where the version is pinned

The version must match in all four places:

| File | Key |
| --- | --- |
| `tools/cli/Makefile` | `GOLANGCI_VERSION` |
| `tools/foas/Makefile` | `GOLANGCI_VERSION` |
| `.github/workflows/code-health-foascli.yml` | `version` (input of the `golangci-lint` step) |
| `.github/workflows/code-health-foas-lib.yml` | `version` (input of the `golangci-lint` step) |

The workflows pin the `golangci/golangci-lint-action` itself by commit SHA. That is a separate
pin from the linter version and is not part of this update.

## Steps

1. Find the latest version on the [releases page](https://github.com/golangci/golangci-lint/releases).
2. Update `GOLANGCI_VERSION` in both Makefiles and `version` in both workflows to the new tag
   (for example `v2.15.0`).
3. Install the new version:

   ```shell
   cd tools/cli && make devtools
   ```

   Check it with `golangci-lint version`.
4. Run the linter in each module and fix what it reports:

   ```shell
   cd tools/cli && make lint
   cd tools/foas && make lint
   ```

   `make fix-lint` in either module applies the automatic fixes.
5. Run the unit tests (`make unit-test`) in both modules.
6. Open a PR with a conventional commit title, for example `chore: bump golangci-lint to v2.15.0`.

## Fixing new findings

- Prefer fixing the code over suppressing the finding.
- A newer version can report `nolintlint` findings for `//nolint` directives that no longer
  suppress anything. Remove those directives.
- Before applying a suggested fix, check it does not change behavior. For example, `gocritic`
  suggests `%#q` instead of a backquoted `%s`, but `%#q` double-quotes and escapes values that
  contain a backtick or newline, which changes the output.
- If you must suppress a finding, scope the `//nolint` to the line and state the reason:
  `//nolint:<linter> // <reason>`.
- Linter settings live in `tools/cli/.golangci.yml` and `tools/foas/.golangci.yml`.
