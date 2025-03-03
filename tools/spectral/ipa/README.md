# IPA Validation

The IPA validation uses [Spectral](https://docs.stoplight.io/docs/spectral/9ffa04e052cc1-spectral-cli) to validate the [MongoDB Atlas Admin API OpenAPI Specification](https://github.com/mongodb/openapi/tree/main/openapi). The rules cover MongoDB best-practices for API design.

**Note:** For MongoDB engineers, please review https://go/ipa-validation-internal-wiki for additional information.

## Running Locally

### Prerequisites

- Node.js >= v20
- npm

### Run Validation

To run the IPA validation locally, install necessary dependencies with `npm install` if you haven't already. Then, simply run:

```
npm run ipa-validation
```

This command will run Spectral CLI for the ruleset [ipa-spectral.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/ipa-spectral.yaml) on the [v2.yaml](https://github.com/mongodb/openapi/blob/main/openapi/v2.json) OpenAPI spec.

The Spectral CLI can also be used to run the validation on any valid OpenAPI file (`json` or `yaml`).

```
spectral lint {path/to/oas/file} --ruleset=./tools/spectral/ipa/ipa-spectral.yaml
```

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
