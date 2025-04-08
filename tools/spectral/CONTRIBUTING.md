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

The rule validations are custom JS functions (see [/rulesets/functions](https://github.com/mongodb/openapi/tree/main/tools/spectral/ipa/rulesets/functions)). To learn more about custom functions, refer to the [Spectral Documentation](https://docs.stoplight.io/docs/spectral/a781e290eb9f9-custom-functions).

The custom rule implementation allows for:

- Advanced validations not available using the standard Spectral rules
- Custom exception handling
- Metrics collection

### Exceptions

Instead of using the [Spectral overrides approach](https://docs.stoplight.io/docs/spectral/293426e270fac-overrides), we use [custom OAS extensions](https://swagger.io/docs/specification/v3_0/openapi-extensions/) to handle exceptions to IPA validation rules. Exception extensions are added to the component which should be exempted, with the Spectral rule name and a reason.

```
"x-xgen-IPA-exception": {
    "xgen-IPA-104-resource-has-GET": "Legacy API, not used by infrastructure-as-code tooling",
}
```
---
## Testing

- IPA Validation related code is tested using [Jest](https://jestjs.io/)
- Each custom validation function has tests, located in [/\_\_tests\_\_](https://github.com/mongodb/openapi/tree/main/tools/spectral/ipa/__tests__). They use the test hook [testRule.js](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/__tests__/__helpers__/testRule.js) as a common approach for Spectral rule testing
- Helper/util functions are tested as well, see [/\_\_tests\_\_/utils](https://github.com/mongodb/openapi/tree/main/tools/spectral/ipa/__tests__/utils)

Install necessary dependencies with `npm install` if you haven't already. All Jest tests can be run with:

```
npm run test
```

To run a single test, in this case `singletonHasNoId.test.js`:

```
npm run test -- singletonHasNoId
```
---

## Code Style

- Use [Prettier](https://prettier.io/) for code formatting

```
npx prettier . --write
```

- [ESLint](https://eslint.org/) is being used for linting
---

## Pull Request Checklist

- [ ] Ensure that code builds and CI tests pass
- [ ] Add or update unit tests as needed
- [ ] Update documentation (if applicable)

```
npm run gen-ipa-docs
```

- [ ] Reference related issues (e.g., Closes #123)
---
## Getting Started with IPA Rule Development

### Resource & Singleton Evaluation

In IPA Spectral validation, a **resource** is typically identified using a *resource collection path*, such as `/resource`.

To develop rules that evaluate resource and singleton patterns, you can use the following utility functions:

####  Retrieve Resource Path Items

Use [`getResourcePathItems`](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L143) to retrieve all relevant path objects for a given resource:

- Returns path objects for:
  - Resource collection path: `/resource`
  - Single resource path: `/resource/{someId}`
  - Custom method paths:
    - `/resource/{someId}:customMethod`
    - `/resource:customMethod`

####  Determine if Resource is a Singleton

Use [`isSingletonResource`](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L71) to check if the resource behaves as a singleton. Pass the object returned by `getResourcePathItems`.

#### Identify Resource Collection or Single Resource Paths

Use the following helpers to check the type of a path:

- [`isResourceCollectionIdentifier`](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L13): Determines if a path represents a resource collection (e.g., `/resource`).
- [`isSingleResourceIdentifier`](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L31): Determines if a path represents a single resource (e.g., `/resource/{someId}`).

> **Note:** Paths such as `/resource/resource` or `/resource/{id}/{id}` are not recognized as valid resource or single resource identifiers using `isResourceCollectionIdentifier` or `isSingleResourceIdentifier`.


### Deciding When to Collect Adoption, Violation, or Exception

In IPA rule development, **adoption**, **violation**, and **exception** must be collected at the same component level — that is, they must share the same `jsonPath`.

#### Helper Functions

Use the following helper functions from the `collectionUtils` module:

- [`collectAndReturnViolation(jsonPath, ruleName, errorData)`](https://github.com/mongodb/openapi/blob/cd4e085a68cb3bb6078e85dba85ad8ce1674f7da/tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js#L14) — for reporting rule violations.
- [`collectAdoption(jsonPath, ruleName)`](https://github.com/mongodb/openapi/blob/cd4e085a68cb3bb6078e85dba85ad8ce1674f7da/tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js#L32) — for marking rule adoption.
- [`collectException(object, ruleName, jsonPath)`](https://github.com/mongodb/openapi/blob/cd4e085a68cb3bb6078e85dba85ad8ce1674f7da/tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js#L32) — for recording rule exceptions.
---
#### Rule Design Guidance

As a rule developer, you need to define:

- What qualifies as a **violation**?
- What qualifies as an **adoption**?
- When should an **exception** be collected?
---
#### Custom Rule Function Signature

Spectral custom rule functions follow this format:

```js
export default (input, _, { path, documentInventory })
```
- `input`: The current component from the OpenAPI spec. Derived from the given and field values in the rule definition.
- `path`: JSONPath array to the current component.
- `documentInventory`: The entire OpenAPI specification (use `resolved` or `unresolved` depending on rule context).

---

#### Rule Implementation Conventions

- Use the **same `jsonPath`** for:
  - `collectAndReturnViolation`
  - `collectAdoption`
  - `collectException`

  > 💡 This path should either be the `path` parameter from the rule function or a derived value from it.

- A rule must collect **only one** of the following for each evaluation:
  - An **adoption**
  - A **violation**
  - An **exception**

- You can include **multiple error messages** for a violation. To do so:
  - Gather the messages into an array
  - Pass them to `collectAndReturnViolation`

- The `input` parameter is assumed to be **defined** when the rule runs. No need to check for its existence.

---

#### Example: Enum Case Validation
To validate an enum and show a separate error for each invalid value:

```js
const errors = [];

for (const value of enumValues) {
  if (!isUpperSnakeCase(value)) {
    errors.push({
      path: [...path, 'enum'],
      message: `${value} is not in UPPER_SNAKE_CASE`,
    });
  }
}

if (errors.length === 0) {
  collectAdoption(path, RULE_NAME);
} else {
  return collectAndReturnViolation(path, RULE_NAME, errors);
}
```

### How to Decide the component level at which the rule will be processed

When designing a rule, think from the custom rule function’s perspective.
Consider which `input` and `jsonPath` values will be most helpful for accurately evaluating the rule and collecting adoption, violation, or exception data.

High-level pseudocode for custom rule functions:

```
const RULE_NAME = 'xgen-IPA-xxx-rule-name'

export default (input, opts, { path, documentInventory }) => {

// TODO Optional filter cases that we do not want to handle
// Return no response for those cases.

//Decide the jsonPath (component level) at which you want to collect exceptions, adoption, and violation
//It can be "path" parameter of custom rule function
//Or, a derived path from "path" parameter
if (hasException(input, RULE_NAME)) {
collectException(input, RULE_NAME, jsonPath);
return;
}

errors = checkViolationsAndReturnErrors(...);
if (errors.length != 0) {
return collectAndReturnViolation(jsonPath, RULE_NAME, errors);
}
return collectAdoption(jsonPath, RULE_NAME);
};

//This function can accept "input", "path", "documentInventory", or other derived parameters
function checkViolationsAndReturnErrors(...){
try {
const errors = []
// TODO validate errors
return errors;
} catch(e) {
handleInternalError(RULE_NAME, jsonPathArray, e);
}
}
```

Each rule must specify the `given` and `then` fields to determine how the rule will traverse and evaluate the OpenAPI document.

**Case 1**: The rule evaluates an object as a whole

- If the given parameter targets a specific object (e.g., HTTP methods like get, post, etc.), and we want to pass that object in its entirety to the rule function:
  - The rule function parameters will be:
    - `input`: The object for the current `<pathKey>` the rule is processing
    - `path`: `[‘paths’, ‘<pathKey>’, ‘get’]`

```
xgen-IPA-xxx-rule-name:
description: "Rule description"
message: "{{error}} http:://go/ipa/x"
severity: warn
given: '$.paths[*].get'
then:
function: "customRuleFunction"
```

**Case 2**: The rule evaluates keys of an object

If the given parameter refers to an object, and we want to iterate through its keys (e.g., top-level API paths), use `@key` to pass each key (string) as the input.

- `input`: API endpoint path string such as `/api/atlas/v2/groups`
- `path`: `[‘paths’, ‘/api/atlas/v2/groups’]`

```
xgen-IPA-xxx-rule-name:
description: "Rule description"
message: "{{error}} http:://go/ipa/x"
severity: warn
given: '$.paths'
then:
field: @key
function: "customRuleFunction"
```

**Case 3**: Parameterized rules

The `functionOptions` in the rule definition can be used to pass additional parameters to your custom rule function. This is useful when you need to configure or provide specific settings to the rule function for more flexible behavior.

- **Example**: Define `functionOptions` within the rule to adjust behavior:

```yaml
xgen-IPA-xxx-rule-name:
  description: "Rule description"
  message: "{{error}} http:://go/ipa/x"
  severity: warn
  given: '$.paths[*].get'
  then:
    function: "customRuleFunction"
    functionOptions:
      option1: "value1"
      option2: "value2"
```

In the custom rule function:
```js
export default (input, opts, { path, documentInventory }) => {
  const { option1, option2 } = opts.functionOptions;
  
  // Use the options in your rule logic
};
```