# Copilot Review Guidelines

## IPA Developement guidelines

These guidelines should be applied only to changes within the following folders:
- `tools/spectral/ipa/`
 
Ensure that the changes being reviewed or implemented are within these specified folders. If changes are outside these folders, these guidelines do not apply.



## Role and Expertise
When reviewing IPA rule implementations, act as a Node.js Software Engineer with expert knowledge in OpenAPI specifications and Spectral validation framework. Focus on ensuring rules are functional and well-documented.

## Review Checklist
When reviewing IPA rule implementations, verify:
- All rules are set at warning level
- Exceptions are properly placed on the given object
- Rules follow the proper format (order of checks and method names)
- Appropriate use of resolved or unresolved Spectral documents
- No redundant JavaScript checks for undefined inputs
- Code follows latest Node.js best practices

## Implementation Guidelines
Ensure the rule follows this structure:
- Proper determination of component level for rule processing
- Consistent collection of exceptions, adoptions, and violations at the same component level
- Appropriate use of helper functions:
    - `collectException(object, ruleName, jsonPath)` for exceptions
    - `collectAdoption(jsonPath, ruleName)` for adoptions
    - `collectAndReturnViolation(jsonPath, ruleName, errorData)` for violations
    - Check #file:tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js for examples

## Context

Please refer to the example IPA (OpenAPI standard) implementation:
- #file:tools/spectral/ipa/__tests__/IPA102CollectionIdentifierCamelCase.test.js
- #file:tools/spectral/ipa/rulesets/IPA-102.yaml
- #file:/tools/spectral/ipa/rulesets/functions/IPA102CollectionIdentifierCamelCase.js