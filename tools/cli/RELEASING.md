# Release FOAS CLI
![Action Summary](https://github.com/mongodb/openapi/assets/5663078/b7717227-fdf1-4fa7-816d-a67735c31377)

## Trigger release workflow

- Using our [Release GitHub Action](https://github.com/mongodb/openapi/actions/workflows/release-cli.yml) run a new workflow using `master` and the following inputs:
  - Version number: `vX.Y.Z`
  - Skip tests: Should be left empty. Only used in case failing tests have been encountered and the team agrees the release can still de done.
  - Using an existing tag: Should be left empty (default `false` creates a new tag from `master`). This should be set to `true` only if you want to re-use an existing tag for the release. This can be helpful for rerunning a failed release process in which the tag has already been created.

- Using [GitHub CLI](https://cli.github.com/), run the command
```bash
cd tools/cli
# Make sure to update version_number with the release version
gh workflow run release-cli.yml -f version_number=vX.Y.Z -f skip_tests=false -f use_existing_tag=false
```
