# Spectral updates

If adding new rules or updating `.spectral.yaml` overall, the validations will instantly get updated across the `mongodb/openapi` repository.

To propagate the changes in MMS, engineers must open an MMS PR and update the pinned commit SHA for the imported spectral file from `mongodb/openapi`.

## Scenarios

There are two scenarios depending on the changes you are making to `.spectral.yaml` and whether it affects the currently published OAS or not.

### Scenario 1: The current OAS doesn't violate the new linting

Please perform the following steps:

1. Open a `mongodb/openapi` PR with the changes to `tools/spectral/.spectral.yaml`
2. Validate that the new Spectral lint checks pass
3. Review and merge the PR
4. Open a PR in MMS, updating the commit SHA of the imported spectral file
5. Validate all tests pass
6. Review and merge the MMS PR

### Scenario 2: The current OAS violates the new linting

There are cases when updating the MMS OAS and the `.spectral.yaml` in `mongodb/openapi` that will cause the spectral linting to fail, because the current published OAS violates the new spectral rules. Changes in the MMS OAS will not be reflected until the next release. In this case please perform the following steps:

1. Open a PR in MMS with the OAS changes and updating the MMS `.spectral.yaml` with the new/changed rules
2. If the current `mongodb/openapi` spectral rules will violate the OAS changes, open a PR in `mongodb/openapi` and update/disable any rules that will fail
3. Validate that the Spectral lint passes in `mongodb/openapi` and in MMS
4. Review and merge both PRs
5. Wait for the next release when the published OAS is updated
6. Open a `mongodb/openapi` PR updating the linting `spectral-lint.yaml` with the linting changes initially added to MMS
7. Validate that all tests pass
8. Review and merge the PR
9. Open a PR in MMS, updating the commit SHA of the imported spectral file, and removing any rules that were added to `mongodb/openapi`
10. Validate all tests pass
11. Review and merge the MMS PR

The end goal is for the `.spectral.yaml` in `mongodb/openapi` to contain all rules for the linting. The published OASes in each environment should comply with those rules.
