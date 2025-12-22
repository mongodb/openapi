<!--- NOTE: This README file is generated, please see /scripts/generateRulesetReadme.js --->

# IPA Validation Rules

All Spectral rules used in the IPA validation are defined in rulesets grouped by IPA number (`IPA-XXX.yaml`). These rulesets are imported into the main IPA ruleset [ipa-spectral.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/ipa-spectral.yaml) which is used for running the validation.

## Rulesets

Below is a list of all available rules, their descriptions and severity levels.

### IPA-005

Rules are based on [https://mongodb.github.io/ipa/5](https://mongodb.github.io/ipa/5).

#### xgen-IPA-005-exception-extension-format

 ![error](https://img.shields.io/badge/error-red) 
IPA exception extensions must follow the correct format.

##### Implementation details
Rule checks for the following conditions:
  - Exception rule names must start with 'xgen-IPA-' prefix followed by exactly 3 digits
  - Exception rule names can be either short format (xgen-IPA-XXX) or full format (xgen-IPA-XXX-rule-name)
  - Rule names in full format can use letters (upper/lowercase), numbers, and hyphens
  - Each exception must include a non-empty reason as a string that starts with uppercase and ends with a full stop
  - This rule itself does not allow exceptions



### IPA-102

Rules are based on [https://mongodb.github.io/ipa/102](https://mongodb.github.io/ipa/102).

#### xgen-IPA-102-collection-identifier-camelCase

 ![error](https://img.shields.io/badge/error-red) 
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
   - If any parent path has an exception for this rule, the exception will be inherited.

#### xgen-IPA-102-path-alternate-resource-name-path-param

 ![error](https://img.shields.io/badge/error-red) 
Paths should alternate between resource names and path params.

##### Implementation details
Rule checks for the following conditions:

  - Paths must follow a pattern where resource names and path parameters strictly alternate
  - Even-indexed path segments should be resource names (not path parameters)
  - Odd-indexed path segments should be path parameters
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation
  - If any parent path has an exception for this rule, the exception will be inherited.

#### xgen-IPA-102-collection-identifier-pattern

 ![error](https://img.shields.io/badge/error-red) 
Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers.

##### Implementation details
Rule checks for the following conditions:

  - All path segments that are not path parameters must match pattern `/^[a-z][a-zA-Z0-9]*$/`
  - Path parameters (inside curly braces) are excluded from validation
  - Custom methods (segments containing colons) are excluded from validation
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation
  - Each non-parameter path segment must start with a lowercase letter followed by any combination of ASCII letters and numbers
  - If any parent path has an exception for this rule, the exception will be inherited.



### IPA-104

Rules are based on [https://mongodb.github.io/ipa/104](https://mongodb.github.io/ipa/104).

#### xgen-IPA-104-resource-has-GET

 ![error](https://img.shields.io/badge/error-red) 
APIs must provide a Get method for resources.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to resource collection identifiers
  - For singleton resources, verifies the resource has a GET method
  - For regular resources, verifies there is a single resource path with a GET method

#### xgen-IPA-104-get-method-returns-single-resource

 ![error](https://img.shields.io/badge/error-red) 
The purpose of the Get method is to return data from a single resource.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to 2xx responses of GET methods on single resources or singleton resources
  - Verifies the response is not an array or paginated result
  - Different error messages are provided for standard vs singleton resources

#### xgen-IPA-104-get-method-response-code-is-200

 ![error](https://img.shields.io/badge/error-red) 
The Get method must return a 200 OK response.
##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on single resources or singleton resources
  - Verifies the 200 OK response code is present
  - Fails if the method lacks a 200 OK response or defines a different 2xx status code

#### xgen-IPA-104-get-method-returns-response-suffixed-object

 ![error](https://img.shields.io/badge/error-red) 
The Get method of a resource should return a "Response" suffixed object.
##### Implementation details
Rule checks for the following conditions:
  - Applies only to 2xx responses of GET methods on single resources or singleton resources
  - Verifies the schema references a predefined schema (not inline)
  - Confirms the referenced schema name ends with "Response" suffix

#### xgen-IPA-104-get-method-response-has-no-input-fields

 ![error](https://img.shields.io/badge/error-red) 
The Get method response object must not include writeOnly properties (fields that should be used only on creation or update, ie output fields).
##### Implementation details
Rule checks for the following conditions:
  - Applies only to 2xx responses of GET methods on single resources or singleton resources
  - Searches through the schema to find any properties marked with writeOnly attribute
  - Fails if any writeOnly properties are found in the response schema

#### xgen-IPA-104-get-method-no-request-body

 ![error](https://img.shields.io/badge/error-red) 
The Get method request must not include a body.
##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on single resources or singleton resources
  - Verifies that the operation object does not contain a requestBody property

#### xgen-IPA-104-valid-operation-id

 ![error](https://img.shields.io/badge/error-red) 
The Operation ID must start with the verb “get” and should be followed by a noun or compound noun.
The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form.
If the resource is a singleton resource, the last noun may be the plural form of the collection identifier.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on single resources or singleton resources
  - Confirms that the existing OperationId is compliant with generated IPA Compliant OperationId

##### Configuration
This rule includes two configuration options:
  - `methodName`: The verb to be used in the OperationIds
  - `ignoreSingularizationList`: Words that are allowed to maintain their assumed plurality (e.g., "Fts")



### IPA-105

Rules are based on [https://mongodb.github.io/ipa/105](https://mongodb.github.io/ipa/105).

#### xgen-IPA-105-list-method-response-code-is-200

 ![error](https://img.shields.io/badge/error-red) 
The List method must return a 200 OK response.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on resource collection paths
  - Ignores singleton resources
  - Verifies the 200 OK response code is present
  - Fails if the method lacks a 200 OK response or defines a different 2xx status code

#### xgen-IPA-105-list-method-no-request-body

 ![error](https://img.shields.io/badge/error-red) 
The List method request must not include a body.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on resource collection paths
  - Ignores singleton resources
  - Verifies that the operation object does not contain a requestBody property

#### xgen-IPA-105-resource-has-list

 ![error](https://img.shields.io/badge/error-red) 
APIs must provide a List method for resources.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to resource collection paths
  - Ignores singleton resources
  - Verifies the resource path has a GET method
  - Fails if the resource path does not have a GET method

#### xgen-IPA-105-list-method-response-is-get-method-response

 ![error](https://img.shields.io/badge/error-red) 
The response body of the List method should consist of the same resource object returned by the Get method.
##### Implementation details Rule checks for the following conditions:
  - Applies only to resource collection paths with JSON content types
  - Ignores singleton resources
  - Ignores responses without a schema or non-paginated responses
  - A response is considered paginated if it has a schema with a 'results' array property
  - Verifies that the schema of items in the 'results' array matches the schema used in the Get method response
  - Fails if the Get method doesn't have a schema reference or if the schemas don't match
  - Validation ignores resources without a Get method
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation
#### xgen-IPA-105-valid-operation-id

 ![error](https://img.shields.io/badge/error-red) 
The Operation ID must start with the verb “list” and should be followed by a noun or compound noun.
The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form, where the last noun is in plural form.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to GET methods on resource collection paths
  - Ignores singleton resources
  - Confirms that the existing OperationId is compliant with generated IPA Compliant OperationId

##### Configuration
This rule includes two configuration options:
  - `methodName`: The verb to be used in the OperationIds
  - `ignoreSingularizationList`: Words that are allowed to maintain their assumed plurality (e.g., "Fts")



### IPA-106

Rules are based on [https://mongodb.github.io/ipa/106](https://mongodb.github.io/ipa/106).

#### xgen-IPA-106-create-method-request-body-is-request-suffixed-object

 ![error](https://img.shields.io/badge/error-red) 
The Create method request should be a Request suffixed object.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to POST methods on resource collection paths (non-singleton resources)
  - Applies only to JSON content types
  - Verifies the schema references a predefined schema (not inline)
  - Confirms the referenced schema name ends with "Request" suffix

#### xgen-IPA-106-create-method-should-not-have-query-parameters

 ![error](https://img.shields.io/badge/error-red) 
Create operations should not use query parameters.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to POST methods on resource collection paths (non-singleton resources)
  - Verifies the operation does not contain query parameters
  - Ignores specified parameters like 'pretty' and 'envelope' via configuration

#### xgen-IPA-106-create-method-request-body-is-get-method-response

 ![error](https://img.shields.io/badge/error-red) 
Request body content of the Create method and response content of the Get method should refer to the same resource.

##### Implementation details

Validation checks the POST method for resource collection paths.
  - Validation ignores resources without a Get method.
  - `readOnly:true` properties of Get method response will be ignored. 
  - `writeOnly:true` properties of Create method request will be ignored.
  - Property comparison is based on `type` and `name` matching.
  - `oneOf` and `discriminator` definitions must match exactly.

#### xgen-IPA-106-create-method-request-has-no-readonly-fields

 ![error](https://img.shields.io/badge/error-red) 
Create method Request object must not include fields with readOnly:true.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to POST methods on resource collection paths (non-singleton resources)
  - Applies only to JSON content types
  - Searches through the request schema to find any properties marked with readOnly attribute
  - Fails if any readOnly properties are found in the request schema

#### xgen-IPA-106-create-method-response-code-is-201

 ![error](https://img.shields.io/badge/error-red) 
Create methods must return a 201 Created response code.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to POST methods on resource collection paths (non-singleton resources)
  - Verifies the 201 Created response code is present
  - Fails if the method lacks a 201 Created response or defines a different 2xx status code

#### xgen-IPA-106-create-method-response-is-get-method-response

 ![error](https://img.shields.io/badge/error-red) 
The response body of the Create method should consist of the same resource object returned by the Get method.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to POST methods on resource collection paths
  - Applies only to JSON response content types
  - Verifies that both Create and Get methods have schema references
  - Confirms that the Create method 201 response schema reference matches the Get method response schema reference
  - Ignores resources without a Get method
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation

#### xgen-IPA-106-readonly-resource-should-not-have-create-method

 ![error](https://img.shields.io/badge/error-red) 
Read-only resources must not define the Create method.

##### Implementation details
Rule checks for the following conditions:
  - Applies to POST methods on resource collection paths
  - Checks if the resource is a read-only resource (all properties in GET response have readOnly:true)
  - If a resource does not have a standard GET method, it is not considered read-only (cannot determine the resource schema)
  - Fails if a Create method is defined on a read-only resource
  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation

#### xgen-IPA-106-valid-operation-id

 ![error](https://img.shields.io/badge/error-red) 
The Operation ID must start with the verb “create” and should be followed by a noun or compound noun.
The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to POST methods that are not [custom methods](https://mongodb.github.io/ipa/109)
  - Confirms that the existing OperationId is compliant with generated IPA Compliant OperationId

##### Configuration
This rule includes two configuration options:
  - `methodName`: The verb to be used in the OperationIds
  - `ignoreSingularizationList`: Words that are allowed to maintain their assumed plurality (e.g., "Fts")



### IPA-107

Rules are based on [https://mongodb.github.io/ipa/107](https://mongodb.github.io/ipa/107).

#### xgen-IPA-107-update-must-not-have-query-params

 ![error](https://img.shields.io/badge/error-red) 
Update operations must not accept query parameters.
##### Implementation details
Validation checks the PATCH/PUT methods for single resource paths and [singleton resources](https://go/ipa/113).

  - Query parameters `envelope` and `pretty` are exempt from this rule
  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation
#### xgen-IPA-107-update-method-response-code-is-200

 ![error](https://img.shields.io/badge/error-red) 
The Update method response status code should be 200 OK.
##### Implementation details
Validation checks the PATCH/PUT methods for single resource paths and [singleton resources](https://go/ipa/113).

  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation
#### xgen-IPA-107-update-method-response-is-get-method-response

 ![error](https://img.shields.io/badge/error-red) 
The response body of the Update method should consist of the same resource object returned by the Get method.
##### Implementation details Rule checks for the following conditions:
  - Applies only to single resource paths and singleton resources with JSON content types
  - Ignores singleton resources and responses without a schema
  - Validation ignores resources without a Get method
  - Fails if the Get method doesn't have a schema reference or if the schemas don't match
  - Paths with `x-xgen-IPA-exception` for this rule are excluded from validation
#### xgen-IPA-107-update-method-request-has-no-readonly-fields

 ![error](https://img.shields.io/badge/error-red) 
Update method Request object must not include fields with readOnly:true.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to Update methods on single resource paths or singleton resources
  - Applies only to JSON content types
  - Searches through the request schema to find any properties marked with readOnly attribute
  - Fails if any readOnly properties are found in the request schema

#### xgen-IPA-107-update-method-request-body-is-get-method-response

 ![error](https://img.shields.io/badge/error-red) 
The request body must contain the resource being updated, i.e. the resource or parts of the resource returned by the Get method.

##### Implementation details

Validation checks the PATCH/PUT methods for single resource paths and singleton resources.
  - Validation ignores resources without a Get method.
  - `readOnly:true` properties of Get method response will be ignored.
  - `writeOnly:true` properties of Update method request will be ignored.
  - Property comparison is based on `type` and `name` matching.
  - `oneOf` and `discriminator` definitions must match exactly.

#### xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object

 ![error](https://img.shields.io/badge/error-red) 
The Update method request schema should reference an `UpdateRequest` suffixed object.

##### Implementation details
Rule checks for the following conditions:
  - Applies to PUT/PATCH methods on single resource paths and singleton resources
  - Applies only to JSON content types
  - Validation only applies to schema references to a predefined schema (not inline)
  - Confirms the referenced schema name ends with "Request" suffix

#### xgen-IPA-107-readonly-resource-should-not-have-update-method

 ![error](https://img.shields.io/badge/error-red) 
Read-only resources must not define the Update method.

##### Implementation details
Rule checks for the following conditions:
  - Applies to PUT/PATCH methods on all resource paths
  - Checks if the resource is a read-only resource (all properties in GET response have readOnly:true)
  - If a resource does not have a standard GET method, it is not considered read-only (cannot determine the resource schema)
  - Fails if an Update method is defined on a read-only resource
  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation

#### xgen-IPA-107-valid-operation-id

 ![error](https://img.shields.io/badge/error-red) 
The Operation ID must start with the verb “update” and should be followed by a noun or compound noun.
The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form.
If the resource is a singleton resource, the last noun may be the plural form of the collection identifier.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to PUT/PATCH methods that are not [custom methods](https://mongodb.github.io/ipa/109)
  - Confirms that the existing OperationId is compliant with generated IPA Compliant OperationId

##### Configuration
This rule includes two configuration options:
  - `methodName`: The verb to be used in the OperationIds
  - `ignoreSingularizationList`: Words that are allowed to maintain their assumed plurality (e.g., "Fts")



### IPA-108

Rules are based on [https://mongodb.github.io/ipa/108](https://mongodb.github.io/ipa/108).

#### xgen-IPA-108-delete-response-should-be-empty

 ![error](https://img.shields.io/badge/error-red) 
Delete method response should not have schema reference to object.

##### Implementation details
Rule checks for the following conditions:
  - Applies to 204 responses in DELETE methods for single resource endpoints (with path parameters)
  - Verifies that the response does not contain a schema property
  - Fails if any content type in the response has a defined schema as reference
  - Skips validation for collection endpoints (without path parameters)

#### xgen-IPA-108-delete-method-return-204-response

 ![error](https://img.shields.io/badge/error-red) 
DELETE method must return 204 No Content.

##### Implementation details
Rule checks for the following conditions:
  - Applies to all DELETE methods for single resource endpoints (with path parameters)
  - Verifies the 204 No Content response code is present
  - Fails if the method lacks a 204 No Content response or defines a different 2xx status code
  - Ensures no other 2xx response codes are defined
  - Fails if the 204 status code is missing or if other 2xx responses exist
  - Skips validation for collection endpoints (without path parameters)

#### xgen-IPA-108-delete-request-no-body

 ![error](https://img.shields.io/badge/error-red) 
DELETE method must not have request body.

##### Implementation details
Rule checks for the following conditions:
  - Applies to all DELETE methods for single resource endpoints (with path parameters)
  - Verifies that the operation object does not contain a requestBody property
  - Fails if any requestBody is defined for the DELETE method
  - Skips validation for collection endpoints (without path parameters)

#### xgen-IPA-108-readonly-resource-should-not-have-delete-method

 ![error](https://img.shields.io/badge/error-red) 
Read-only resources must not define the Delete method.

##### Implementation details
Rule checks for the following conditions:
  - Applies to DELETE methods on single resource paths and singleton resources
  - Checks if the resource is a read-only resource (all properties in GET response have readOnly:true)
  - If a resource does not have a standard GET method, it is not considered read-only (cannot determine the resource schema)
  - Fails if a Delete method is defined on a read-only resource
  - Operation objects with `x-xgen-IPA-exception` for this rule are excluded from validation

#### xgen-IPA-108-valid-operation-id

 ![error](https://img.shields.io/badge/error-red) 
The Operation ID must start with the verb “delete” and should be followed by a noun or compound noun.
The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to DELETE methods that are not [custom methods](https://mongodb.github.io/ipa/109)
  - Confirms that the existing OperationId is compliant with generated IPA Compliant OperationId
##### Configuration
This rule includes two configuration options:
  - `methodName`: The verb to be used in the OperationIds
  - `ignoreSingularizationList`: Words that are allowed to maintain their assumed plurality (e.g., "Fts")



### IPA-109

Rules are based on [https://mongodb.github.io/ipa/109](https://mongodb.github.io/ipa/109).

#### xgen-IPA-109-custom-method-must-be-GET-or-POST

 ![error](https://img.shields.io/badge/error-red) 
The HTTP method for custom methods must be GET or POST.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to paths containing custom method identifiers (with colon format)
  - Verifies the HTTP methods used are either GET or POST
  - Fails if any other HTTP methods are used (PUT, DELETE, PATCH, etc.)
  - Fails if multiple valid methods are defined for the same custom method endpoint

#### xgen-IPA-109-custom-method-must-use-camel-case

 ![error](https://img.shields.io/badge/error-red) 
The custom method must use camelCase format.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to paths containing custom method identifiers (with colon format)
  - Extracts the method name portion following the colon
  - Verifies the method name is not empty or blank
  - Validates that the method name uses proper camelCase formatting
  - Fails if the method name contains invalid casing (such as snake_case, PascalCase, etc.)

#### xgen-IPA-109-custom-method-identifier-format

 ![error](https://img.shields.io/badge/error-red) 
Custom methods must be defined using a colon followed by the method name.

##### Implementation details
Rule checks for the following conditions:
  - Identifies paths containing a colon (potential custom methods)
  - Validates that the path follows proper custom method format
  - Does not validate after the colon (xgen-IPA-109-custom-method-must-use-camel-case rule validates the method name)
  - Fails if a slash appears before a colon
  - Fails if multiple colons appear in the path
  - Fails if other than an alphabetical character or a closing curly brace appears before a colon

#### xgen-IPA-109-valid-operation-id

 ![error](https://img.shields.io/badge/error-red) 
The Operation ID must start with the custom method verb (the custom method path section delimited by the colon (:) character) and should be followed by a noun or compound noun.
If the custom Operation ID has a verb + noun, the Operation ID should end with the noun.
The noun(s) in the Operation ID should be the collection identifiers from the resource identifier.
The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form, where the last noun:
  - Is in plural form if the method applies to a collection of resources
  - Is in singular form if the method applies to a single resource

##### Implementation details
Rule checks for the following conditions:
  - Applies only to paths containing custom method identifiers (with colon format)
  - Confirms that the existing OperationId is compliant with generated IPA Compliant OperationId

##### Configuration
This rule includes one configuration options:
  - `ignoreSingularizationList`: Words that are allowed to maintain their assumed plurality (e.g., "Fts")



### IPA-110

Rules are based on [https://mongodb.github.io/ipa/110](https://mongodb.github.io/ipa/110).

#### xgen-IPA-110-collections-use-paginated-prefix

 ![error](https://img.shields.io/badge/error-red) 
APIs that return collections of resources must use a schema with the "Paginated" prefix.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to List methods (GET operations that return collections of resources)
  - Checks if List method has a response schema defined
  - Checks that the 200 response schema references a schema with a "Paginated" prefix

#### xgen-IPA-110-collections-response-define-results-array

 ![error](https://img.shields.io/badge/error-red) 
The response for collections must define an array of results containing the paginated resource.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to List methods (GET operations that return collections of resources)
  - Verifies the 200 response schema has the required results fields

#### xgen-IPA-110-collections-request-has-itemsPerPage-query-param

 ![error](https://img.shields.io/badge/error-red) 
The request should support an integer itemsPerPage query parameter allowing users to specify the maximum number of results to return per page.
itemsPerPage must not be required
itemsPerPage default value should be 100.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to List methods (GET on resource collection paths)
  - Verifies the operation includes itemsPerPage query parameter
  - Verifies the itemsPerPage query parameter is not required
  - Verifies the itemsPerPage query parameter has a default value of 100

#### xgen-IPA-110-collections-request-has-pageNum-query-param

 ![error](https://img.shields.io/badge/error-red) 
The request should support an integer pageNum query parameter allowing users to specify the maximum number of results to return per page.
pageNum must not be required
pageNum default value should be 1.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to List methods (GET on resource collection paths)
  - Verifies the operation includes pageNum query parameter
  - Verifies the pageNum query parameter is not required
  - Verifies the pageNum query parameter has a default value of 1

#### xgen-IPA-110-collections-request-includeCount-not-required

 ![error](https://img.shields.io/badge/error-red) 
If the request supports an includeCount query parameter, it must not be required.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to List methods (GET on resource collection paths)
  - Checks if includeCount query parameter exists
  - If it exists, verifies the includeCount parameter is not required

#### xgen-IPA-110-collections-response-define-links-array

 ![error](https://img.shields.io/badge/error-red) 
The response for collections should define a links array field, providing links to next and previous pages.

##### Implementation details
Rule checks for the following conditions:
  - Only applies to List methods (GET operations that return collections of resources)
  - Verifies the response schema includes a links field of type array



### IPA-112

Rules are based on [https://mongodb.github.io/ipa/112](https://mongodb.github.io/ipa/112).

#### xgen-IPA-112-avoid-project-field-names

 ![error](https://img.shields.io/badge/error-red) 
Schema field names should avoid using "project", "projects", or "projectId".

##### Implementation details
Rule checks for the following conditions:
  - Searches through all schemas in the API definition
  - Identifies property names that match "project" (case-insensitive)
  - Ignores fields where prohibited words appear with specified words (e.g., "gcpProjectId")
  - Reports any instances where these field names are used
  - Suggests using "group", "groups", or "groupId" as alternatives

#### xgen-IPA-112-field-names-are-camel-case

 ![error](https://img.shields.io/badge/error-red) 
Schema field names should be in camelCase format.

##### Implementation details
Rule checks for the following conditions:
  - Searches through all schemas in the API definition
  - Identifies property names that are not in camelCase format
  - Reports any instances where these field names are not in camelCase format

#### xgen-IPA-112-boolean-field-names-avoid-is-prefix

 ![error](https://img.shields.io/badge/error-red) 
Boolean field names should avoid the "is" prefix.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to properties with type 'boolean'
  - Identifies property names that start with "is" followed by an uppercase letter
  - Suggests using the direct adjective form instead (e.g., "disabled" instead of "isDisabled")



### IPA-113

Rules are based on [https://mongodb.github.io/ipa/113](https://mongodb.github.io/ipa/113).

#### xgen-IPA-113-singleton-must-not-have-id

 ![error](https://img.shields.io/badge/error-red) 
Singleton resources must not have a user-provided or system-generated ID.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to singleton resources that are identified as resource collection identifiers
  - Checks that the resource has a GET method defined
  - Examines all 2xx response schemas from the GET method
  - Verifies that no schema contains 'id' or '_id' properties in their object definitions
  - Fails if any response schema contains these identifier properties

#### xgen-IPA-113-singleton-must-not-have-delete-method

 ![error](https://img.shields.io/badge/error-red) 
Singleton resources must not define the Delete standard method.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to singleton resources
  - Checks that the resource does not have a DELETE method defined

#### xgen-IPA-113-singleton-should-have-update-method

 ![error](https://img.shields.io/badge/error-red) 
Singleton resources should define the Update method. Validation for the presence of Get method is covered by IPA-104 (see [xgen-IPA-104-resource-has-GET](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-resource-has-GET)).

##### Implementation details
Rule checks for the following conditions:
  - Applies only to singleton resources
  - Excludes read-only singleton resources (where all properties in the GET response schema are marked as readOnly; for List responses, all properties in the items schema must be readOnly)
  - Checks that the resource has the PUT and/or PATCH methods defined



### IPA-114

Rules are based on [https://mongodb.github.io/ipa/114](https://mongodb.github.io/ipa/114).

#### xgen-IPA-114-error-responses-refer-to-api-error

 ![error](https://img.shields.io/badge/error-red) 
APIs must return ApiError when errors occur

##### Implementation details
This rule checks that all 4xx and 5xx error responses reference the ApiError schema.

#### xgen-IPA-114-api-error-has-bad-request-detail

 ![error](https://img.shields.io/badge/error-red) 
ApiError schema should have badRequestDetail field with proper structure.

##### Implementation details
Rule checks that:
- ApiError schema has badRequestDetail field
- badRequestDetail must include an array of fields
- Each field must include description and field properties
- This rule does not allow exceptions

#### xgen-IPA-114-authenticated-endpoints-have-auth-errors

 ![error](https://img.shields.io/badge/error-red) 
Authenticated endpoints must define 401 and 403 responses.

##### Implementation details
This rule checks that all authenticated endpoints (those without explicit 'security: []' 
and not containing '/unauth' in the path) include 401 and 403 responses.

#### xgen-IPA-114-parameterized-paths-have-404-not-found

 ![error](https://img.shields.io/badge/error-red) 
Paths with parameters must define 404 responses.

##### Implementation details
This rule checks that all endpoints with path parameters (identified by '{param}' 
in the path) include a 404 response to handle the case when the requested resource
is not found.



### IPA-117

Rules are based on [https://mongodb.github.io/ipa/117](https://mongodb.github.io/ipa/117).

#### xgen-IPA-117-description

 ![error](https://img.shields.io/badge/error-red) 
API producers must provide descriptions for Properties, Operations and Parameters.

##### Implementation details
Rule checks for description property in the following components:
  - Info object
  - Tags
  - Operation objects
  - Inline schema properties for operation object requests and responses
  - Parameter objects (in operations and components)
  - Schema properties
The rule also fails if the description is an empty string.

#### xgen-IPA-117-description-starts-with-uppercase

 ![error](https://img.shields.io/badge/error-red) 
Descriptions must start with Uppercase.

##### Implementation details
Rule checks the format of the description property in the following components:
  - Info object
  - Tags
  - Operation objects
  - Inline schema properties for operation object requests and responses
  - Parameter objects (in operations and components)
  - Schema properties
  - Schemas

#### xgen-IPA-117-description-ends-with-period

 ![error](https://img.shields.io/badge/error-red) 
Descriptions must end with a full stop(.).

##### Implementation details
Rule checks the format of the description property in the following components:
  - Info object
  - Tags
  - Operation objects
  - Inline schema properties for operation object requests and responses
  - Parameter objects (in operations and components)
  - Schema properties
  - Schemas
The rule ignores descriptions that end with `|`, i.e. inline markdown tables

#### xgen-IPA-117-description-must-not-use-html

 ![error](https://img.shields.io/badge/error-red) 
Descriptions must not use raw HTML.

##### Implementation details
Rule checks the format of the descriptions for components:
  - Info object
  - Tags
  - Operation objects
  - Inline schema properties for operation object requests and responses
  - Parameter objects (in operations and components)
  - Schema properties
  - Schemas
The rule validates that the description content does not include opening and/or closing HTML tags.

#### xgen-IPA-117-description-should-not-use-inline-tables

 ![error](https://img.shields.io/badge/error-red) 
Descriptions should not include inline tables as this may not work well with all tools, in particular generated client code.

##### Implementation details
Rule checks the format of the descriptions for components:
  - Info object
  - Tags
  - Operation objects
  - Inline schema properties for operation object requests and responses
  - Parameter objects (in operations and components)
  - Schema properties
  - Schemas
The rule validates that the description content does not include inline markdown tables.

#### xgen-IPA-117-description-should-not-use-inline-links

 ![error](https://img.shields.io/badge/error-red) 
Descriptions should not include inline links.

##### Implementation details
Rule checks the format of the descriptions for components:
  - Tags
  - Operation objects
  - Inline schema properties for operation object requests and responses
  - Parameter objects (in operations and components)
  - Schema properties
  - Schemas
The rule validates that the description content does not include inline markdown links. The rule ignores HTML `<a>` links - this is covered by `xgen-IPA-117-description-must-not-use-html`.

#### xgen-IPA-117-plaintext-response-must-have-example

 ![error](https://img.shields.io/badge/error-red) 
For APIs that respond with plain text, for example CSV, API producers must provide an example. Some tools are not able to generate examples for such responses

##### Implementation details
  - The rule only applies to 2xx responses
  - The rule ignores JSON and YAML responses (passed as `allowedTypes`)
  - The rule ignores responses with `format: 'binary'` (i.e. file types)
  - The rule checks for the presence of the example property as a sibling to the `schema` property, or inside the `schema` object

#### xgen-IPA-117-objects-must-be-well-defined

 ![error](https://img.shields.io/badge/error-red) 
Components of type "object" must be well-defined, i.e. have of one of the properties:
  - `schema`
  - `examples`
  - `example`
  - `oneOf`, `anyOf` or `allOf`
  - `properties`
  - `additionalProperties`

##### Implementation details
The rule applies to the following components:
  - Inline operation responses/request bodies (JSON only)
  - Inline operation response/request body properties (JSON only)
  - Inline operation response/request body array items (JSON only)
  - Schemas defined in `components/schemas`
  - Schema properties defined in `components/schemas`
  - `items` properties defined in `components/schemas`
The rule is applied to the unresolved OAS, and ignores components with `$ref` properties. Specific paths can be ignored using the `ignoredPaths` option.

#### xgen-IPA-117-parameter-has-examples-or-schema

 ![error](https://img.shields.io/badge/error-red) 
API producers must provide a well-defined schema or example(s) for parameters.

##### Implementation details
The rule checks for the presence of the `schema`, `examples` or `example` property in:
  - Operation parameters
  - Parameters defined in `components/parameters`

#### xgen-IPA-117-operation-summary-format

 ![error](https://img.shields.io/badge/error-red) 
Operation summaries must use Title Case, must not end with a period and must not use CommonMark.

##### Implementation details
The rule checks that the `summary` property of all operations are in Title Case.

##### Configuration
This rule includes two configuration options:
  - `ignoreList`: Words that are allowed to maintain their specific casing (e.g., "API", "AWS", "DNS")
  - `grammaticalWords`: Common words that can remain lowercase in titles (e.g., "and", "or", "the")

#### xgen-IPA-117-get-operation-summary-starts-with

 ![error](https://img.shields.io/badge/error-red) 
In operation summaries, use 'Return' instead of 'Get' or 'List'. For example "Return One Identity Provider".

##### Implementation details
- The rule checks that the `summary` property of get and list operations use the word 'Return' as the first word.
- The rule only applies to get and list methods and ignores custom methods
##### Configuration
This rule includes a configuration option:
  - `allowedStartVerbs`: Allow list of verb that the operation summary can start with, defaults to `['Return']`

#### xgen-IPA-117-update-operation-summary-starts-with

 ![error](https://img.shields.io/badge/error-red) 
In operation summaries, use 'Update' instead of 'Modify' or 'Change'. For example "Update One Identity Provider".

##### Implementation details
- The rule checks that the `summary` property of update operations use the word 'Update' as the first word.
- The rule only applies to update methods and ignores custom methods
##### Configuration
This rule includes a configuration option:
  - `allowedStartVerbs`: Allow list of verb that the operation summary can start with, defaults to `['Update']`

#### xgen-IPA-117-create-operation-summary-starts-with

 ![error](https://img.shields.io/badge/error-red) 
In operation summaries, use 'Create' when the operation is creating a resource, and use 'Add' when the resource itself isn't being created. For example "Create One Identity Provider" or "Add One MongoDB Cloud User to One Project".

##### Implementation details
- The rule checks that the `summary` property of create operations use the word 'Create' or 'Add' as the first word.
- The rule only applies to create methods and ignores custom methods
##### Configuration
This rule includes a configuration option:
  - `allowedStartVerbs`: Allow list of verb that the operation summary can start with, defaults to `['Create', 'Add']`

#### xgen-IPA-117-delete-operation-summary-starts-with

 ![error](https://img.shields.io/badge/error-red) 
In operation summaries, use 'Delete' when the operation is destroying a resource, and use 'Remove' when the resource itself isn't being destroyed. For example "Delete One Identity Provider" or "Remove One MongoDB Cloud User from One Project".

##### Implementation details
- The rule checks that the `summary` property of delete operations use the word 'Delete' or 'Remove' as the first word.
- The rule only applies to delete methods and ignores custom methods
##### Configuration
This rule includes a configuration option:
  - `allowedStartVerbs`: Allow list of verb that the operation summary can start with, defaults to `['Delete', 'Remove']`

#### xgen-IPA-117-operation-summary-single-item-wording

 ![error](https://img.shields.io/badge/error-red) 
API Producers must use "One" when referring to a single item instead of "a" or "specified".

##### Implementation details
- The rule checks that the `summary` property of operations does not use the words "a", "specified" or "provided"
- This rule applies to all operations, including custom methods
##### Configuration
This rule includes a configuration option:
  - `preferredWords`: List of words that the operation summary should use for single items, defaults to `['one']`. Only used for error messages
  - `forbiddenWords`: List of words (lowercase) that the operation summary should not use, defaults to `['a', 'specified']`



### IPA-118

Rules are based on [https://mongodb.github.io/ipa/118](https://mongodb.github.io/ipa/118).

#### xgen-IPA-118-no-additional-properties-false

 ![error](https://img.shields.io/badge/error-red) 
Schemas must not use `additionalProperties: false`

##### Implementation details
This rule checks that schemas don't restrict additional properties by setting `additionalProperties: false`.
Schemas without explicit `additionalProperties` settings (which default to true) or with `additionalProperties` set to `true` are compliant.
This rule checks all nested schemas, but only parent schemas can be marked for exception.



### IPA-119

Rules are based on [https://mongodb.github.io/ipa/119](https://mongodb.github.io/ipa/119).

#### xgen-IPA-119-no-default-for-cloud-providers

 ![error](https://img.shields.io/badge/error-red) 
When using a provider field or parameter, API producers should not define a default value.
This rule checks fields and parameters named "cloudProvider" and ensures they do not have a default value.
It also checks enum fields that might contain cloud provider values.
All cloudProviderEnumValues should be listed in the enum array.



### IPA-121

Rules are based on [https://mongodb.github.io/ipa/121](https://mongodb.github.io/ipa/121).

#### xgen-IPA-121-date-time-fields-mention-iso-8601

 ![error](https://img.shields.io/badge/error-red) 
Fields with format="date-time" should mention ISO 8601 and UTC in their description.
It collects adoption metrics at schema property level and parameter level



### IPA-123

Rules are based on [https://mongodb.github.io/ipa/123](https://mongodb.github.io/ipa/123).

#### xgen-IPA-123-enum-values-must-be-upper-snake-case

 ![error](https://img.shields.io/badge/error-red) 
Enum values must be UPPER_SNAKE_CASE.

##### Implementation details
Rule checks for the following conditions:
  - Applies to all enum value arrays defined in the OpenAPI schema
  - Resolves the schema object that contains the enum values
  - Validates each enum value individually against the UPPER_SNAKE_CASE pattern
  - Skips validation if the schema has an exception defined for this rule

#### xgen-IPA-123-allowable-enum-values-should-not-exceed-20

 ![error](https://img.shields.io/badge/error-red) 
Allowable enum values should not exceed 20 entries.

##### Implementation details
Rule checks for the following conditions:
  - Validates that each enum set has 20 or fewer values
  - Skips validation if the schema has an exception defined for this rule
  - This validation threshold can be adjusted by changing the functionOptions.maxEnumValues parameter



### IPA-124

Rules are based on [https://mongodb.github.io/ipa/124](https://mongodb.github.io/ipa/124).

#### xgen-IPA-124-array-max-items

 ![error](https://img.shields.io/badge/error-red) 
Array fields must have a `maxItems` property defined to enforce an upper bound on the number of items (recommended max: 100). If the array field has the chance of being too large, the API should use a sub-resource instead.

##### Implementation details
Rule checks for the following conditions:

  - All schema objects with type 'array' must have a `maxItems` property
  - The `maxItems` value must be lower than or equal to 100

##### Function options
        - maxAllowedValue: Required integer parameter specifying the maximum allowed value for the `maxItems` property (100)
        - ignore: Required array parameter listing property names to be exempted from validation



### IPA-125

Rules are based on [https://mongodb.github.io/ipa/125](https://mongodb.github.io/ipa/125).

#### xgen-IPA-125-oneOf-must-have-discriminator

 ![error](https://img.shields.io/badge/error-red) 
Each oneOf property must include a discriminator property to define the exact type.

##### Implementation details
Rule checks for the following conditions:
  - Applies only to schemas with `oneOf` containing references
  - Ensures a `discriminator` property is present with a valid `propertyName`
  - Validates that `discriminator.mapping` contains exactly the same number of entries as `oneOf` references
  - Validates that each `discriminator.mapping` value matches a reference in the `oneOf` array
  - Ignores `oneOf` definitions with inline schemas

##### Matching Logic
- The `discriminator.mapping` must have the same number of entries as there are references in the `oneOf` array
- Each value in the `discriminator.mapping` must match one of the `$ref` values in the `oneOf` array
- Each `$ref` in the `oneOf` array must have a corresponding entry in the `discriminator.mapping`
- Example:
  ```yaml
  oneOf:
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Cat'
  discriminator:
    propertyName: type
    mapping:
      dog: '#/components/schemas/Dog'
      cat: '#/components/schemas/Cat'
  ```
  This is valid because there are exactly 2 mappings for 2 oneOf references, and all values match.

#### xgen-IPA-125-oneOf-no-base-types

 ![error](https://img.shields.io/badge/error-red) 
API producers should not use oneOf with different base types like integer, string, boolean, or number or references at the same time.

##### Implementation details
Rule checks for the following conditions:
  - Applies to schemas with `oneOf` arrays
  - Ensures no mixing of base types with references
  - Ensures no multiple different base types in the same oneOf
  - Base types considered are: integer, string, boolean, number
  - Using the same base type multiple times is allowed (e.g., multiple string enums)

##### Rationale
Using oneOf with multiple primitive types can lead to ambiguity and validation problems. Clients may not 
be able to properly determine which type to use in which context. Instead, use more specific 
object types with clear discriminators.

#### xgen-IPA-125-oneOf-schema-property-same-type

 ![error](https://img.shields.io/badge/error-red) 
If multiple `oneOf` models define a property with the same name, that property **must** have the same base type or schema in each model

##### Implementation details
Rule checks for the following conditions:
  - Applies only to object type schemas with `oneOf`
  - Ensures that if a property is defined in multiple `oneOf` schemas, it must have the same type in each schema (base type or object schema)

#### xgen-IPA-125-discriminator-must-accompany-oneOf-anyOf-allOf

 ![error](https://img.shields.io/badge/error-red) 
Each discriminator property must be accompanied by a `oneOf`, `anyOf` or `allOf` property 

##### Implementation details
- Rule checks that a `discriminator` property has a `oneOf`, `anyOf` or `allOf` sibling



### IPA-126

Rules are based on [https://mongodb.github.io/ipa/126](https://mongodb.github.io/ipa/126).

#### xgen-IPA-126-tag-names-should-use-title-case

 ![error](https://img.shields.io/badge/error-red) 
Tag names in the OpenAPI specification should use Title Case.

##### Implementation details
Rule checks for the following conditions:
  - All tag names defined in the OpenAPI tags object should use Title Case 
  - Title Case means each word starts with an uppercase letter, and the rest are lowercase
  - Certain abbreviations (like "API", "AWS", etc.) in the ignoreList are allowed to maintain their casing
  - Grammatical words (like "and", "or", "the", etc.) are allowed to be all lowercase

##### Configuration
This rule includes two configuration options:
  - `ignoreList`: Words that are allowed to maintain their specific casing (e.g., "API", "AWS", "DNS")
  - `grammaticalWords`: Common words that can remain lowercase in titles (e.g., "and", "or", "the")




