<!--- NOTE: This README file is generated, please see /scripts/generateRulesetReadme.js --->

# IPA Validation Rules

All Spectral rules used in the IPA validation are defined in rulesets grouped by IPA number (`IPA-XXX.yaml`). These rulesets are imported into the main IPA ruleset [ipa-spectral.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/ipa-spectral.yaml) which is used for running the validation.

## Rulesets

The tables below lists all available rules, their descriptions and severity level.

### IPA-005

For rule definitions, see [IPA-005.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-005.yaml).

| Rule Name                               | Description                                                              | Severity |
| --------------------------------------- | ------------------------------------------------------------------------ | -------- |
| xgen-IPA-005-exception-extension-format | IPA exception extensions must follow the correct format. http://go/ipa/5 | error    |

### IPA-102

For rule definitions, see [IPA-102.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-102.yaml).

| Rule Name                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Severity |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| xgen-IPA-102-path-alternate-resource-name-path-param | Paths should alternate between resource names and path params. http://go/ipa/102                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | error    |
| xgen-IPA-102-collection-identifier-camelCase         | Collection identifiers must be in camelCase. Logic includes:<br/> - All path segments that are not path parameters<br/> - Only the resource identifier part before any colon in custom method paths (e.g., `resource` in `/resource:customMethod`)<br/> - Path parameters should also follow camelCase naming<br/> - Certain values can be exempted via the ignoredValues configuration (e.g., 'v1', 'v2') that can be supplied as `ignoredValues`  argument to the rule<br/> - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation<br/> - Double slashes (//) are not allowed in paths<br/> http://go/ipa/102 | warn     |
| xgen-IPA-102-collection-identifier-pattern           | Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers. http://go/ipa/102                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | warn     |

### IPA-104

For rule definitions, see [IPA-104.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-104.yaml).

| Rule Name                                                | Description                                                                                                                                                       | Severity |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| xgen-IPA-104-resource-has-GET                            | APIs must provide a Get method for resources. http://go/ipa/104                                                                                                   | warn     |
| xgen-IPA-104-get-method-returns-single-resource          | The purpose of the Get method is to return data from a single resource. http://go/ipa/104                                                                         | warn     |
| xgen-IPA-104-get-method-response-code-is-200             | The Get method must return a 200 OK response. http://go/ipa/104                                                                                                   | warn     |
| xgen-IPA-104-get-method-returns-response-suffixed-object | The Get method of a resource should return a "Response" suffixed object. http://go/ipa/104                                                                        | warn     |
| xgen-IPA-104-get-method-response-has-no-input-fields     | The Get method response object must not include writeOnly properties (fields that should be used only on creation or update, ie output fields). http://go/ipa/104 | warn     |
| xgen-IPA-104-get-method-no-request-body                  | The Get method request must not include a body. http://go/ipa/104                                                                                                 | warn     |

### IPA-105

For rule definitions, see [IPA-105.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-105.yaml).

| Rule Name                                     | Description                                                        | Severity |
| --------------------------------------------- | ------------------------------------------------------------------ | -------- |
| xgen-IPA-105-list-method-response-code-is-200 | The List method must return a 200 OK response. http://go/ipa/105   | warn     |
| xgen-IPA-105-list-method-no-request-body      | The List method request must not include a body. http://go/ipa/105 | warn     |
| xgen-IPA-105-resource-has-list                | APIs must provide a List method for resources. http://go/ipa/105   | warn     |

### IPA-106

For rule definitions, see [IPA-106.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-106.yaml).

| Rule Name                                                          | Description                                                                                                                                                                            | Severity |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| xgen-IPA-106-create-method-request-body-is-request-suffixed-object | The Create method request should be a Request suffixed object. http://go/ipa/106                                                                                                       | warn     |
| xgen-IPA-106-create-method-should-not-have-query-parameters        | Create operations should not use query parameters. http://go/ipa/106                                                                                                                   | warn     |
| xgen-IPA-106-create-method-request-body-is-get-method-response     | Request body content of the Create method and response content of the Get method should refer to the same resource.
readOnly/writeOnly properties will be ignored.  http://go/ipa/106
 | warn     |
| xgen-IPA-106-create-method-response-code-is-201                    | Create methods must return a 201 Created response code. http://go/ipa/106                                                                                                              | warn     |

### IPA-108

For rule definitions, see [IPA-108.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-108.yaml).

| Rule Name                                      | Description                                                                                      | Severity |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| xgen-IPA-108-delete-response-should-be-empty   | Delete method response should not have schema reference to object. http://go/ipa/108             | warn     |
| xgen-IPA-108-delete-method-return-204-response | DELETE method must return 204 No Content. http://go/ipa/108                                      | warn     |
| xgen-IPA-108-delete-include-404-response       | DELETE method must include 404 response and return it when resource not found. http://go/ipa/108 | warn     |
| xgen-IPA-108-delete-request-no-body            | DELETE method must not have request body. http://go/ipa/108                                      | warn     |

### IPA-109

For rule definitions, see [IPA-109.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-109.yaml).

| Rule Name                                      | Description                                                               | Severity |
| ---------------------------------------------- | ------------------------------------------------------------------------- | -------- |
| xgen-IPA-109-custom-method-must-be-GET-or-POST | The HTTP method for custom methods must be GET or POST. http://go/ipa/109 | error    |
| xgen-IPA-109-custom-method-must-use-camel-case | The custom method must use camelCase format. http://go/ipa/109            | error    |

### IPA-113

For rule definitions, see [IPA-113.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-113.yaml).

| Rule Name                               | Description                                                                                 | Severity |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| xgen-IPA-113-singleton-must-not-have-id | Singleton resources must not have a user-provided or system-generated ID. http://go/ipa/113 | warn     |

### IPA-123

For rule definitions, see [IPA-123.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/rulesets/IPA-123.yaml).

| Rule Name                                         | Description                                             | Severity |
| ------------------------------------------------- | ------------------------------------------------------- | -------- |
| xgen-IPA-123-enum-values-must-be-upper-snake-case | Enum values must be UPPER_SNAKE_CASE. http://go/ipa/123 | error    |


