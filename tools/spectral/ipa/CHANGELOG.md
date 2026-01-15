### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### [ipa-validation-ruleset-v9.1.1](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v9.1.0...ipa-validation-ruleset-v9.1.1)

> 15 January 2026

- fix(ipa): Add AI to tags ignore list [`#1093`](https://github.com/mongodb/openapi/pull/1093)
- chore(ipa): remove temp overrides [`#1088`](https://github.com/mongodb/openapi/pull/1088)

#### [ipa-validation-ruleset-v9.1.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v9.0.0...ipa-validation-ruleset-v9.1.0)

> 12 January 2026

- fix(ipa): Add AI to operation summary format ignore list [`#1077`](https://github.com/mongodb/openapi/pull/1077)
- fix(ipa): Support read-only detection for singleton List responses [`#1061`](https://github.com/mongodb/openapi/pull/1061)

### [ipa-validation-ruleset-v9.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v8.0.0...ipa-validation-ruleset-v9.0.0)

> 22 December 2025

- fix(ipa): Skip read-only validation for resources without GET method [`#1059`](https://github.com/mongodb/openapi/pull/1059)

### [ipa-validation-ruleset-v8.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v7.0.0...ipa-validation-ruleset-v8.0.0)

> 22 December 2025

- fix(ipa): Support read-only standard and singleton resources [`#1057`](https://github.com/mongodb/openapi/pull/1057)

### [ipa-validation-ruleset-v7.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v6.0.0...ipa-validation-ruleset-v7.0.0)

> 16 December 2025

- fix(ipa): Update inline tables regex to handle whitespaces [`#1046`](https://github.com/mongodb/openapi/pull/1046)
- chore(ipa): remove temp overrides [`#1047`](https://github.com/mongodb/openapi/pull/1047)
- chore(ipa): Update README.md to mention `ipa-collector-results-combined.log` [`#977`](https://github.com/mongodb/openapi/pull/977)
- fix(ipa): fix import issue with parquet-wasm package [`#976`](https://github.com/mongodb/openapi/pull/976)
- chore(ipa): bump parquet-wasm from 0.6.1 to 0.7.0 [`#969`](https://github.com/mongodb/openapi/pull/969)

### [ipa-validation-ruleset-v6.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v5.0.0...ipa-validation-ruleset-v6.0.0)

> 15 September 2025

- fix(ipa): Remove temporary overrides from Spectral file [`#954`](https://github.com/mongodb/openapi/pull/954)
- feat(ipa): Upgrade warning-level rules to the error level [`#952`](https://github.com/mongodb/openapi/pull/952)

### [ipa-validation-ruleset-v5.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v4.0.0...ipa-validation-ruleset-v5.0.0)

> 5 September 2025

- fix(ipa): Fix IPA005 rule to allow camel case and numbers in rule name [`#940`](https://github.com/mongodb/openapi/pull/940)

### [ipa-validation-ruleset-v4.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v3.3.0...ipa-validation-ruleset-v4.0.0)

> 2 September 2025

- fix(ipa): make operation ID rules error-level [`#932`](https://github.com/mongodb/openapi/pull/932)
- fix(ipa): refactor, rename pluralization ignore list [`#929`](https://github.com/mongodb/openapi/pull/929)

### [ipa-validation-ruleset-v3.3.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v2.3.0...ipa-validation-ruleset-v3.3.0)

> 28 August 2025

- fix(ipa): Handle abbreviations/numbers in op ID rules [`#927`](https://github.com/mongodb/openapi/pull/927)
- fix(ipa): exception reason formatting [`#918`](https://github.com/mongodb/openapi/pull/918)

#### [ipa-validation-ruleset-v2.3.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v2.2.0...ipa-validation-ruleset-v2.3.0)

> 22 August 2025

- fix(ipa): use rule name from function input instead of hard coded name [`#914`](https://github.com/mongodb/openapi/pull/914)
- feat(ipa): new rule xgen-IPA-117-operation-summary-single-item-wording [`#913`](https://github.com/mongodb/openapi/pull/913)
- fix(ipa): return internal errors as Spectral errors [`#912`](https://github.com/mongodb/openapi/pull/912)
- feat(ipa): new rules for operation summaries starting with specific words [`#903`](https://github.com/mongodb/openapi/pull/903)

#### [ipa-validation-ruleset-v2.2.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v2.1.0...ipa-validation-ruleset-v2.2.0)

> 19 August 2025

- fix(ipa): Add ignore list for nouns in OperationID Validation [`#901`](https://github.com/mongodb/openapi/pull/901)
- feat(ipa): new rule xgen-IPA-117-get-operation-summary-starts-with [`#900`](https://github.com/mongodb/openapi/pull/900)

#### [ipa-validation-ruleset-v2.1.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v2.0.0...ipa-validation-ruleset-v2.1.0)

> 15 August 2025

- feat(ipa): new rule xgen-IPA-117-operation-summary-format [`#897`](https://github.com/mongodb/openapi/pull/897)
- fix(ipa): child path identifiers inherit parent path exceptions [`#896`](https://github.com/mongodb/openapi/pull/896)

### [ipa-validation-ruleset-v2.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v1.1.0...ipa-validation-ruleset-v2.0.0)

> 15 August 2025

- feat(ipa): new IPA rule xgen-IPA-125-discriminator-must-accompany-oneOf-anyOf-allOf [`#893`](https://github.com/mongodb/openapi/pull/893)
- fix(ipa): include schema descriptions in IPA117 rules [`#895`](https://github.com/mongodb/openapi/pull/895)

#### [ipa-validation-ruleset-v1.1.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v1.0.0...ipa-validation-ruleset-v1.1.0)

> 14 August 2025

- feat(ipa): New rule xgen-IPA-125-oneOf-schema-property-same-type [`#873`](https://github.com/mongodb/openapi/pull/873)

### [ipa-validation-ruleset-v1.0.0](https://github.com/mongodb/openapi/compare/ipa-validation-ruleset-v0.0.1...ipa-validation-ruleset-v1.0.0)

> 13 August 2025

- fix(ipa): Validate both inline and reusable enums [`#890`](https://github.com/mongodb/openapi/pull/890)
- feat(ipa): error on unneeded exceptions IPA 117-126 [`#881`](https://github.com/mongodb/openapi/pull/881)
- feat(ipa): error on unneeded exceptions IPA 108-114 [`#880`](https://github.com/mongodb/openapi/pull/880)
- feat(ipa): error on unneeded exceptions IPA 105-107 [`#878`](https://github.com/mongodb/openapi/pull/878)
- feat(ipa): error on unneeded exceptions IPA 005-104 [`#877`](https://github.com/mongodb/openapi/pull/877)
- docs(ipa): update ipa readme [`#876`](https://github.com/mongodb/openapi/pull/876)

<!-- auto-changelog-above -->

#### ipa-validation-ruleset-v0.0.1

> 8 August 2025

First release of IPA Validation Ruleset package.
