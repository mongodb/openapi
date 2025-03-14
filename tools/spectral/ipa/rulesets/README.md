<!--- NOTE: This README file is generated, please see /scripts/generateRulesetReadme.js --->

# IPA Validation Rules

All Spectral rules used in the IPA validation are defined in rulesets grouped by IPA number (`IPA-XXX.yaml`). These rulesets are imported into the main IPA ruleset [ipa-spectral.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/ipa-spectral.yaml) which is used for running the validation.

## Rulesets

Below is a list of all available rules, their descriptions and severity levels.

### IPA-005

Rule is based on [http://go/ipa/IPA-5](http://go/ipa/IPA-5).

#### xgen-IPA-005-exception-extension-format

 ![error](https://img.shields.io/badge/error-red) 
IPA exception extensions must follow the correct format.

##### Implementation details
Rule checks for the following conditions:
  - Exception rule names must start with 'xgen-IPA-' prefix
  - Each exception must include a non-empty reason as a string
  - This rule itself does not allow exceptions



### IPA-102

Rule is based on [http://go/ipa/IPA-102](http://go/ipa/IPA-102).

#### xgen-IPA-102-path-alternate-resource-name-path-param

 ![error](https://img.shields.io/badge/error-red) 
Paths should alternate between resource names and path params.

##### Implementation details
Rule checks for the following conditions:

  - Paths must follow a pattern where resource names and path parameters strictly alternate
  - Even-indexed path segments should be resource names (not path parameters)
  - Odd-indexed path segments should be path parameters
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation

#### xgen-IPA-102-collection-identifier-camelCase

 ![warn](https://img.shields.io/badge/warning-yellow) 
Collection identifiers must be in camelCase.

 ##### Implementation details
 Rule checks for the following conditions:

   - All path segments that are not path parameters
   - Only the resource identifier part before any colon in custom method paths (e.g., `resource` in `/resource:customMethod`)
   - Path parameters should also follow camelCase naming
   - Certain values can be exempted via the ignoredValues configuration that can be supplied as `ignoredValues` 
   argument to the rule
   - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation
   - Double slashes (//) are not allowed in paths

#### xgen-IPA-102-collection-identifier-pattern

 ![warn](https://img.shields.io/badge/warning-yellow) 
Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers.

##### Implementation details
Rule checks for the following conditions:

  - All path segments that are not path parameters must match pattern `/^[a-z][a-zA-Z0-9]*$/`
  - Path parameters (inside curly braces) are excluded from validation
  - Custom methods (segments containing colons) are excluded from validation
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation
  - Each non-parameter path segment must start with a lowercase letter followed by any combination of ASCII letters and numbers



### IPA-104

Rule is based on [http://go/ipa/IPA-104](http://go/ipa/IPA-104).

#### xgen-IPA-104-resource-has-GET

 ![warn](https://img.shields.io/badge/warning-yellow) 
APIs must provide a Get method for resources.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to resource collection identifiers
  - For singleton resources, verifies the resource has a GET method
  - For regular resources, verifies there is a single resource path with a GET method

#### xgen-IPA-104-get-method-returns-single-resource

 ![warn](https://img.shields.io/badge/warning-yellow) 
The purpose of the Get method is to return data from a single resource.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to 2xx responses of GET methods on single resources or singleton resources
  - Verifies the response is not an array or paginated result
  - Different error messages are provided for standard vs singleton resources

#### xgen-IPA-104-get-method-response-code-is-200

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method must return a 200 OK response.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on single resources or singleton resources
  - Verifies the 200 OK response code is present
  - Fails if the method lacks a 200 OK response or defines a different 2xx status code

#### xgen-IPA-104-get-method-returns-response-suffixed-object

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method of a resource should return a "Response" suffixed object.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to 2xx responses of GET methods on single resources or singleton resources
  - Verifies the schema references a predefined schema (not inline)
  - Confirms the referenced schema name ends with "Response" suffix

#### xgen-IPA-104-get-method-response-has-no-input-fields

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method response object must not include writeOnly properties (fields that should be used only on creation or update, ie output fields).

##### Implementation details
Rule checks for the following conditions:
  - Applies only to 2xx responses of GET methods on single resources or singleton resources
  - Searches through the schema to find any properties marked with writeOnly attribute
  - Fails if any writeOnly properties are found in the response schema

#### xgen-IPA-104-get-method-no-request-body

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method request must not include a body.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on single resources or singleton resources
  - Verifies that the operation object does not contain a requestBody property



### IPA-105

Rule is based on [http://go/ipa/IPA-105](http://go/ipa/IPA-105).

#### xgen-IPA-105-list-method-response-code-is-200

 ![warn](https://img.shields.io/badge/warning-yellow) 
The List method must return a 200 OK response.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on resource collection paths
  - Ignores singleton resources
  - Verifies the 200 OK response code is present
  - Fails if the method lacks a 200 OK response or defines a different 2xx status code

#### xgen-IPA-105-list-method-no-request-body

 ![warn](https://img.shields.io/badge/warning-yellow) 
The List method request must not include a body.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on resource collection paths
  - Ignores singleton resources
  - Verifies that the operation object does not contain a requestBody property

#### xgen-IPA-105-resource-has-list

 ![warn](https://img.shields.io/badge/warning-yellow) 
APIs must provide a List method for resources.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to resource collection paths
  - Ignores singleton resources
  - Verifies the resource path has a GET method
  - Fails if the resource path does not have a GET method

#### xgen-IPA-105-list-method-response-is-get-method-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
The response body of the List method should consist of the same resource object returned by the Get method.
##### Implementation details Rule checks for the following conditions:
  - Applies only to resource collection paths with JSON content types
  - Ignores singleton resources
  - Ignores responses without a schema or non-paginated responses
  - A response is considered paginated if it has a schema with a 'results' array property
  - Verifies that the schema of items in the 'results' array matches the schema used in the Get method response
  - Fails if the Get method doesn't have a schema reference or if the schemas don't match
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation


### IPA-106

Rule is based on [http://go/ipa/IPA-106](http://go/ipa/IPA-106).

#### xgen-IPA-106-create-method-request-body-is-request-suffixed-object

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Create method request should be a Request suffixed object.
##### Implementation details
Validation checks the POST method for resource collection paths.
#### xgen-IPA-106-create-method-should-not-have-query-parameters

 ![warn](https://img.shields.io/badge/warning-yellow) 
Create operations should not use query parameters.
##### Implementation details
Validation checks the POST method for resource collection paths.
#### xgen-IPA-106-create-method-request-body-is-get-method-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
Request body content of the Create method and response content of the Get method should refer to the same resource.
##### Implementation details
Validation checks the POST method for resource collection paths.
  - Validation ignores resources without a Get method.
  - `readOnly:true` properties of Get method response will be ignored. 
  - `writeOnly:true` properties of Create method request will be ignored.
  - Property comparison is based on `type` and `name` matching.
  - `oneOf` and `discriminator` definitions must match exactly.
#### xgen-IPA-106-create-method-request-has-no-readonly-fields

 ![warn](https://img.shields.io/badge/warning-yellow) 
Create method Request object must not include fields with readOnly:true.
##### Implementation details
Validation checks the POST method for resource collection paths.
#### xgen-IPA-106-create-method-response-code-is-201

 ![warn](https://img.shields.io/badge/warning-yellow) 
Create methods must return a 201 Created response code.
##### Implementation details
Validation checks the POST method for resource collection paths.
#### xgen-IPA-106-create-method-response-is-get-method-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
The response body of the Create method should consist of the same resource object returned by the Get method.
##### Implementation details
Validation checks that the Create method 201 Created response contains reference to the same schema as the Get method response.

  - Validation applies to Create methods for resource collections only
  - Validation applies to json response content only
  - Validation ignores responses without schema
  - Validation ignores resources without a Get method
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation


### IPA-107

Rule is based on [http://go/ipa/IPA-107](http://go/ipa/IPA-107).

#### xgen-IPA-107-put-must-not-have-query-params

 ![warn](https://img.shields.io/badge/warning-yellow) 
Update operations must not accept query parameters.
##### Implementation details
Validation checks the PUT method for single resource paths and singleton resources.

  - Query parameters `envelope` and `pretty` are exempt from this rule
  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation
#### xgen-IPA-107-patch-must-not-have-query-params

 ![warn](https://img.shields.io/badge/warning-yellow) 
Update operations must not accept query parameters.
##### Implementation details
Validation checks the PATCH method for single resource paths and singleton resources.

  - Query parameters `envelope` and `pretty` are exempt from this rule
  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation
#### xgen-IPA-107-put-method-response-code-is-200

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Update method response status code should be 200 OK.
##### Implementation details
Validation checks the PUT method for single resource paths and [singleton resources](https://go/ipa/113).

  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation
#### xgen-IPA-107-patch-method-response-code-is-200

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Update method response status code should be 200 OK.
##### Implementation details
Validation checks the PATCH method for single resource paths and [singleton resources](https://go/ipa/113).

  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation


### IPA-108

Rule is based on [http://go/ipa/IPA-108](http://go/ipa/IPA-108).

#### xgen-IPA-108-delete-response-should-be-empty

 ![warn](https://img.shields.io/badge/warning-yellow) 
Delete method response should not have schema reference to object.
#### xgen-IPA-108-delete-method-return-204-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
DELETE method must return 204 No Content.
#### xgen-IPA-108-delete-include-404-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
DELETE method must include 404 response and return it when resource not found.
#### xgen-IPA-108-delete-request-no-body

 ![warn](https://img.shields.io/badge/warning-yellow) 
DELETE method must not have request body.


### IPA-109

Rule is based on [http://go/ipa/IPA-109](http://go/ipa/IPA-109).

#### xgen-IPA-109-custom-method-must-be-GET-or-POST

 ![error](https://img.shields.io/badge/error-red) 
The HTTP method for custom methods must be GET or POST.
#### xgen-IPA-109-custom-method-must-use-camel-case

 ![error](https://img.shields.io/badge/error-red) 
The custom method must use camelCase format.


### IPA-113

Rule is based on [http://go/ipa/IPA-113](http://go/ipa/IPA-113).

#### xgen-IPA-113-singleton-must-not-have-id

 ![warn](https://img.shields.io/badge/warning-yellow) 
Singleton resources must not have a user-provided or system-generated ID.


### IPA-123

Rule is based on [http://go/ipa/IPA-123](http://go/ipa/IPA-123).

#### xgen-IPA-123-enum-values-must-be-upper-snake-case

 ![error](https://img.shields.io/badge/error-red) 
Enum values must be UPPER_SNAKE_CASE.



