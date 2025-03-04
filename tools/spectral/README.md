# MongoDB API Spectral Validation

A set of custom validator rules for the MongoDB Atlas Programmatic API, adhering to API Standards (IPA)
## Structure

- **/ipa** - Contains custom Spectral rulesets covering MongoDB API standards.
- **/.spectral.yaml** - Contains validators not specifically related to API standards.

### Custom Rules

For a complete list of implemented rules, please refer to the [Ruleset Documentation](./ipa/rulesets/README.md).

### Updating the .spectral.yaml Ruleset

When adding new rules or updating the `.spectral.yaml` file, the validations will automatically update across the `mongodb/openapi` repository. Follow these steps:

1. Open a pull request (PR) in the `mongodb/openapi` repository with changes to `tools/spectral/.spectral.yaml`.
2. Ensure that the new Spectral lint checks pass.
3. Review and merge the PR.

### Internal Documentation

- Refer to the [IPA Standards](http://go/ipa) for specific rules.
- Visit the [Spectral Wiki](http://go/openapi-spectral-updates) for additional information.
