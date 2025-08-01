# Contributing to MongoDB Spectral Validations

Thank you for your interest in contributing! We welcome contributions of all kinds—bug fixes, new features, documentation improvements, and more.

> **Note:** For MongoDB engineers, please review https://go/ipa-validation-internal-wiki for additional information.

---
## Legacy Spectral Rule Development

### Updating the .spectral.yaml Ruleset

When adding new rules or updating the `.spectral.yaml` file, the validations will automatically update across the `mongodb/openapi` repository. Follow these steps:

1. Open a pull request (PR) in the `mongodb/openapi` repository with changes to `tools/spectral/.spectral.yaml`.
2. Ensure that the new Spectral lint checks pass.
3. Review and merge the PR.
---
## IPA Rule Development
Please see the [IPA Contributing](./ipa/CONTRIBUTING.md) for more information.