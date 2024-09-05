# Spectral updates

If adding new rules or updating .spectral.yaml overall, the validations will instantly get updated across mongodb/openapi repository.

To propagate the changes in MMS, engineers must open a PR and update the pinned commit sha in mms.

Please perform the following steps:
1. [ ] Open a PR with the spectral changes and validate that the Spectral lint checks work.
2. [ ] Review and merge the PR.
3. [ ] Open a PR in mms, updating the commit sha of the spectral file imported.
4. [ ] Validate all tests pass.