# Contributing to IPA Validations

Thank you for your interest in contributing! We welcome contributions of all kinds—bug fixes, new features, documentation improvements, and more.

**Note:** For MongoDB engineers, please review https://go/ipa-validation-internal-wiki for additional information.

## Rule Implementation

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

## Code Style

- Use [Prettier](https://prettier.io/) for code formatting

```
npx prettier . --write
```

- [ESLint](https://eslint.org/) is being used for linting

## Pull Request Checklist

- [ ] Ensure that code builds and CI tests pass
- [ ] Add or update unit tests as needed
- [ ] Update documentation (if applicable)

```
npm run gen-ipa-docs
```

- [ ] Reference related issues (e.g., Closes #123)

## Technical Decisions

### Resource & Singleton Evaluation

In the IPA Spectral validation, a resource can be identified using a resource collection path.

For example, resource collection path: `/resource`

- To get all paths and the path objects for this resource, use [getResourcePathItems](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L143)

  - Will return path objects for paths (if present):
    - Resource collection path `/resource`
    - Single resource path `/resource + /{someId}`
    - Custom method path(s)
      - `/resource + /{someId} + :customMethod`
      - `/resource + :customMethod`

- To check if a resource is a singleton, take the returned object from [getResourcePathItems](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L143) and evaluate the resource using [isSingletonResource](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L71)
- To check if a path belongs to a resource collection, use [isResourceCollectionIdentifier](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L13)
- To check if a path belongs to a single resource, use [isSingleResourceIdentifier](https://github.com/mongodb/openapi/blob/99823b3dfd315f892c5f64f1db50f2124261929c/tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js#L31)

![info](https://img.shields.io/badge/info-blue) Note: Paths like `/resource/resource` or `/resource/{id}/{id}` are not evaluated as valid resource or single resource paths using isResourceCollectionIdentifier or isSingleResourceIdentifier.

### Rule Implementation Guidelines

#### How to Decide when to collect adoption and violation

The collection of adoption, violation, and exemption should be at the same component level - i.e., the same jsonPath level.

Use

- [collectAndReturnViolation(jsonPath, ruleName, errorData)](https://github.com/mongodb/openapi/blob/cd4e085a68cb3bb6078e85dba85ad8ce1674f7da/tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js#L14) for violation collection
- [collectAdoption(jsonPath,ruleName)](https://github.com/mongodb/openapi/blob/cd4e085a68cb3bb6078e85dba85ad8ce1674f7da/tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js#L32) for adoption collection
- [collectException(object, ruleName, jsonPath)](https://github.com/mongodb/openapi/blob/cd4e085a68cb3bb6078e85dba85ad8ce1674f7da/tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js#L32) for exception collection

The rule developer should decide on which cases the rule will be considered as adopted and violated.

- **Example**: IPA guideline - Enumeration values must be UPPER_SNAKE_CASE
- **Decision Process**

Custom Spectral rule functions in the format of

```
export default (input, _, { path, documentInventory })
```

- `input`: When the Spectral rule is processed according to the given and field parameters of the rule definition, input is the current component being processed.
- `path`: JSONPath to current input
- `documentInventory`: Whole OpenAPI spec (retrieve resolved or unresolved according to the need)

When implementing a custom Spectral rule, please follow these conventions:

- If adoption, violation, and exception data should be collected at the same component level, ensure all helper functions use the same `jsonPath`.
  This path is either passed directly as the Spectral rule function's parameter or derived from it.
- Use this `jsonPath` consistently in:

  - `collectAndReturnViolation`
  - `collectAdoption`
  - `collectException`

- Input assumptions:
  The custom rule function assumes its input is never undefined. You do not need to validate the presence or structure of the input parameter.

- Expected behavior: A rule must collect exactly one of:

  - an adoption,
  - a violation, or
  - an exception.

- Violations can include multiple error messages, if needed.
  In that case, gather all messages into an array and pass it to `collectAndReturnViolation`, which is responsible for displaying messages to users.

💡 Example:

If you're validating an `enum` and want to highlight each invalid value, collect the individual error messages into an array and pass it to `collectAndReturnViolation`.

```
const errors = []
...

errors.push({
path: <jsonPath array for violation>,
message: <custom error message>
});

....

if (errors.length === 0) {
collectAdoption(jsonPath, RULE_NAME);
} else {
return collectAndReturnViolation(jsonPath, RULE_NAME, errors);
}
```

#### How to Decide the component level at which the rule will be processed

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
