# Spectral updates

If adding new rules or updating `.spectral.yaml` overall, the validations will instantly get updated across the `mongodb/openapi` repository.

Please perform the following steps:

1. Open a `mongodb/openapi` PR with the changes to `tools/spectral/.spectral.yaml`
2. Validate that the new Spectral lint checks pass
3. Review and merge the PR

**Note:** For MongoDB engineers, please review http://go/openapi-spectral-updates.
