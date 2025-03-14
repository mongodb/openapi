<!--- NOTE: This README file is generated, please see /scripts/generateRulesetReadme.js --->

# IPA Validation Rules

All Spectral rules used in the IPA validation are defined in rulesets grouped by IPA number (`IPA-XXX.yaml`). These rulesets are imported into the main IPA ruleset [ipa-spectral.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/ipa-spectral.yaml) which is used for running the validation.

## Rulesets

Below is a list of all available rules, their descriptions and severity levels.

### IPA-005

Rule is based on [http://go/ipa/IPA-5](http://go/ipa/IPA-5).

#### xgen-IPA-005-exception-extension-format

 ![error](https://img.shields.io/badge/error-red) 
IPA exception extensions must follow the correct format. http://go/ipa/5

##### Implementation details
Rule checks for the following conditions:
  - Exception rule names must start with 'xgen-IPA-' prefix
  - Each exception must include a non-empty reason as a string
  - This rule itself does not allow exceptions



### IPA-102

Rule is based on [http://go/ipa/IPA-102](http://go/ipa/IPA-102).

#### xgen-IPA-102-path-alternate-resource-name-path-param

 ![error](https://img.shields.io/badge/error-red) 
Paths should alternate between resource names and path params. http://go/ipa/102
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
Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers. http://go/ipa/102


### IPA-104

Rule is based on [http://go/ipa/IPA-104](http://go/ipa/IPA-104).

#### xgen-IPA-104-resource-has-GET

 ![warn](https://img.shields.io/badge/warning-yellow) 
APIs must provide a Get method for resources. http://go/ipa/104
#### xgen-IPA-104-get-method-returns-single-resource

 ![warn](https://img.shields.io/badge/warning-yellow) 
The purpose of the Get method is to return data from a single resource. http://go/ipa/104
#### xgen-IPA-104-get-method-response-code-is-200

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method must return a 200 OK response. http://go/ipa/104
#### xgen-IPA-104-get-method-returns-response-suffixed-object

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method of a resource should return a "Response" suffixed object. http://go/ipa/104
#### xgen-IPA-104-get-method-response-has-no-input-fields

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method response object must not include writeOnly properties (fields that should be used only on creation or update, ie output fields). http://go/ipa/104
#### xgen-IPA-104-get-method-no-request-body

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Get method request must not include a body. http://go/ipa/104


### IPA-105

Rule is based on [http://go/ipa/IPA-105](http://go/ipa/IPA-105).

#### xgen-IPA-105-list-method-response-code-is-200

 ![warn](https://img.shields.io/badge/warning-yellow) 
The List method must return a 200 OK response. http://go/ipa/105
#### xgen-IPA-105-list-method-no-request-body

 ![warn](https://img.shields.io/badge/warning-yellow) 
The List method request must not include a body. http://go/ipa/105
#### xgen-IPA-105-resource-has-list

 ![warn](https://img.shields.io/badge/warning-yellow) 
APIs must provide a List method for resources. http://go/ipa/105


### IPA-106

Rule is based on [http://go/ipa/IPA-106](http://go/ipa/IPA-106).

#### xgen-IPA-106-create-method-request-body-is-request-suffixed-object

 ![warn](https://img.shields.io/badge/warning-yellow) 
The Create method request should be a Request suffixed object. http://go/ipa/106 This rule applies only to POST requests targeting resource collection URIs.
#### xgen-IPA-106-create-method-should-not-have-query-parameters

 ![warn](https://img.shields.io/badge/warning-yellow) 
Create operations should not use query parameters. http://go/ipa/106 This rule applies only to POST requests targeting resource collection URIs.
#### xgen-IPA-106-create-method-request-body-is-get-method-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
Request body content of the Create method and response content of the Get method should refer to the same resource. http://go/ipa/106 readOnly/writeOnly properties will be ignored.   This rule applies only to POST requests targeting resource collection URIs.
#### xgen-IPA-106-create-method-request-has-no-readonly-fields

 ![warn](https://img.shields.io/badge/warning-yellow) 
Create method Request object must not include fields with readOnly:true. http://go/ipa/106 This rule applies only to POST requests targeting resource collection URIs.
#### xgen-IPA-106-create-method-response-code-is-201

 ![warn](https://img.shields.io/badge/warning-yellow) 
Create methods must return a 201 Created response code. http://go/ipa/106 This rule applies only to POST requests targeting resource collection URIs.


### IPA-108

Rule is based on [http://go/ipa/IPA-108](http://go/ipa/IPA-108).

#### xgen-IPA-108-delete-response-should-be-empty

 ![warn](https://img.shields.io/badge/warning-yellow) 
Delete method response should not have schema reference to object. http://go/ipa/108
#### xgen-IPA-108-delete-method-return-204-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
DELETE method must return 204 No Content. http://go/ipa/108
#### xgen-IPA-108-delete-include-404-response

 ![warn](https://img.shields.io/badge/warning-yellow) 
DELETE method must include 404 response and return it when resource not found. http://go/ipa/108
#### xgen-IPA-108-delete-request-no-body

 ![warn](https://img.shields.io/badge/warning-yellow) 
DELETE method must not have request body. http://go/ipa/108


### IPA-109

Rule is based on [http://go/ipa/IPA-109](http://go/ipa/IPA-109).

#### xgen-IPA-109-custom-method-must-be-GET-or-POST

 ![error](https://img.shields.io/badge/error-red) 
The HTTP method for custom methods must be GET or POST. http://go/ipa/109
#### xgen-IPA-109-custom-method-must-use-camel-case

 ![error](https://img.shields.io/badge/error-red) 
The custom method must use camelCase format. http://go/ipa/109


### IPA-113

Rule is based on [http://go/ipa/IPA-113](http://go/ipa/IPA-113).

#### xgen-IPA-113-singleton-must-not-have-id

 ![warn](https://img.shields.io/badge/warning-yellow) 
Singleton resources must not have a user-provided or system-generated ID. http://go/ipa/113


### IPA-123

Rule is based on [http://go/ipa/IPA-123](http://go/ipa/IPA-123).

#### xgen-IPA-123-enum-values-must-be-upper-snake-case

 ![error](https://img.shields.io/badge/error-red) 
Enum values must be UPPER_SNAKE_CASE. http://go/ipa/123



