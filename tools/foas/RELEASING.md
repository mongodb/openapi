# Release FOAS Library

## Trigger release workflow

- Using our [Release GitHub Action](https://github.com/mongodb/openapi/actions/workflows/release-foas.yml) run a new workflow using `main` and the following inputs:
  - Version number: `vX.Y.Z`
  - Skip tests: Should be left empty. Only used in case failing tests have been encountered and the team agrees the release can still be done.
  - Using an existing tag: Should be left empty (default `false` creates a new tag from `main`). Set to `true` only if you want to re-use an existing tag for the release (e.g. rerunning a failed release where the tag is already created).

- Using [GitHub CLI](https://cli.github.com/), run:
  ```bash
  # Replace vX.Y.Z with the release version
  gh workflow run release-foas.yml -f version_number=vX.Y.Z -f skip_tests=false -f use_existing_tag=false
  ```

## What the workflow does

1. Validates the version number format.
2. Creates a single tag pointing at the release commit:
   - `tools/foas/vX.Y.Z` — Go submodule tag. External consumers (e.g. mcp-server in [`mongodb-labs/oasis`](https://github.com/mongodb-labs/oasis)) pin this via `go.mod`.
3. Runs the library QA test suite (`code-health-foas.yml`) unless `skip_tests=true`.
4. No binary is produced — see [`tools/cli/RELEASING.md`](../cli/RELEASING.md) for the foascli binary release.

## When to bump the library version

Library releases are independent of binary releases. Bump whenever there's a change in `tools/foas/**` that downstream Go consumers might want — added public API, behavior changes, bug fixes. The library tends to release more frequently than the binary.

Internal-only changes (test helpers, internal package refactors, docs in `internal/`) typically don't need a version bump.
