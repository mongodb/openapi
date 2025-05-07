# IPA (Improvement Proposal for APIs)

## IPA-5: Documenting Exceptions to IPAs
- API producers must document within the OpenAPI spec when “should” or “must” guidance in an IPA is intentionally ignored to avoid unintentionally setting the wrong precedent for design
- API producers must document the exception at the appropriate level within the OpenAPI spec to align with the scope of the rule being enforced
- API producer may define multiple exceptions at the same level if needed

## IPA-101: Resource Oriented Design

- A resource-oriented API should generally be modeled as a resource hierarchy
  - Each node is either a simple resource or a collection of resources
  - A collection contains resources of the same type
  - A resource usually has fields"
- Resources may have any number of sub-resources
- Clients must be able to validate the state of resources after performing a mutation such as Create, Update, or Delete
- APIs should prefer standard methods over custom methods
- Unsupported operations on readonly resources should return 405 Not Allowed
- Unsupported operations must not be documented

## IPA-102: Resource Identifiers
- The full resource identifier is a URI without transport protocols (schemeless)
- Resource identifiers must use the slash (/) character to separate individual segments of the resource identifier
- Resource identifiers should not use abbreviations unless the abbreviation is well understood
- Collection identifiers must be plural
- Nested Collections: If a resource identifier contains multiple levels of a hierarchy and a parent collection's name is used as a prefix for the child resource's name, the child collection's name may omit the prefix.
- Nested Collections: Deleting a parent must delete associated children
- Nested Collections: Access to the parent may imply access to children
- Nested Collections: Children must not belong to multiple parents

## IPA-103: Methods
- API authors should choose from the defined categories in the following order:
- Standard methods (on collections and resources)
- Custom methods (on collections, resources, or stateless)"
- Standard methods must not cause side effects. In such scenario where a side effect is necessary a custom method should be used
- Standard methods must guarantee atomicity

## IPA-104: Get
- The method must not cause side effects

## IPA-105: List
- The method must not cause side effects

## IPA-106: Create
- APIs should provide a create method for resources unless it is not valuable for users to do so. The HTTP verb must be POST

## IPA-107: Update
- APIs should provide an update method for resources unless it is not valuable for users to do so. The HTTP verb should be PATCH and support partial resource update
- The HTTP verb may be PUT If the method will only ever support full resource replacement (PUT is strongly discouraged because it becomes a backward-incompatible change to add fields to the resource)

## IPA-108: Delete
- APIs should provide a Delete method for resources unless it is not valuable for users to do so. The HTTP verb must be DELETE
- The Delete method should succeed if and only if a resource was present and was successfully deleted. If the resource did not exist, the method should send a NOT_FOUND error
- If an API allows deletion of a resource that may have child resources, the API should provide a cascading=true query parameter.

## IPA-109: Custom Methods

- Custom methods should only be used for functionality that can not be easily expressed via standard methods
- The name of the method should be a verb and may be followed by a noun
- The HTTP URI must use a colon(:) character followed by the custom method name
- Declarative-friendly resources should not employ custom methods

## IPA-110: Pagination
- APIs returning collections of data must provide pagination at the outset, as it is a backward-incompatible change to add pagination to an existing method
- If the user does not specify itemsPerPage (or specifies 0) the API must not return an error and chooses an appropriate default of 100
- If the user specifies itemsPerPage greater than the maximum permitted by the API, the API should coerce down to the maximum permitted page size
- If the user does not specify pageNum (or specifies 0) the API must not return an error and chooses an appropriate default of 1 and the offset (skip) must be calculated as (pageNum - 1) * itemsPerPage
- If the user does not specify includeCount the API must not return an error and chooses an appropriate default of true
- A next page link must only be included if there’s a next page available or if the service can not determine if the end of the collection has been reached
- A previous page link must be included if there's a previous page available
- The response for collections may provide an integer totalCount field, providing the user with the total number of resources available in the backing collection. This total may be an estimate but the API should explicitly document that

## IPA-112: Field Names

- Field names should communicate the concept being presented and avoid ambiguous names. Field names should avoid including unnecessary words
- Field names should not use abbreviations unless the abbreviation is well understood, for example: IP, AWS, TCP
- APIs should aim to use the same name for the same concept and different names for different concepts wherever possible. Including across APIs and resources. Names should follow/be unified between GUI and API
- Repeated fields must use the proper plural form
- Field names must not be named to reflect an intent or action. Fields must not be verbs - disabled not disable
- Field names of common conventions must use the same field name and description as existing fields
- Field names must refer to a singular concept when used across APIs
- Existing concepts must map to a singular field name
- For enum fields the allowable values may differ from values allowed in other instances of the field

## IPA-113: Singleton Resources

- Singleton resources must not define the Create or Delete standard methods
- Singleton resources may define custom methods as appropriate

## IPA-114: Errors
- Errors must use the canonical error codes defined in com.xgen.svc.mms.api.res.common.ApiErrorCode
- APIs should avoid unexpected errors by correctly handling validations and exposing as the appropriate error
- APIs should make the best effort to validate as much as possible of the request and include all validation errors in the field badRequestDetail
- APIs should make the best effort to help customers with possible next steps in case of an error by adding the help field. "help" must include a short description as description. "help" must include a link to the documentation url

## IPA-115: Envelope Object

- Resources may support a boolean envelope query parameter
- Envelope must default to false
- If envelope is set to true for individual resources, the response must include the field status as the HTTP status code and the response must include the field content as the requested resource
- If envelope is set to true for Paginated resources the existing response must include the field status as the HTTP status code
- Generated clients must not support envelope

## IPA-117: Documentation

- Descriptions should be complete but brief. Descriptions should aim to cover what it is, how to use it, default values, optional or required behavior and common errors
- Descriptions should avoid overly technical language
- Descriptions must avoid company internal language conventions
- Descriptions should prefer simple syntax that can easily be translated for non-english speakers
- API producers must document default values
- API producers must detail the required/optional nature of the field and any conditions in both responses and requests
- Documentation may link to more detailed external documentation when more in depth information is pertinent
- For APIs where fields can be mutually exclusive API producers should provide correct examples to consumers on how to use the API.
- API producers may document valid patterns, for example /^[a-zA-Z0-9][a-zA-Z0-9-]*$/. API producers should avoid overly specific patterns since changes to a pattern can be considered a breaking change
- API producers may document minimum or maximum values for a numeric value. If documented API producers must also document if inclusive or not
- API producers may document minItems or maxItems for repeated fields
- API producers may document minLength or maxLength for string values
- API producers must not combine unrelated validation keywords

## IPA-118: Extensible by Default

- Request parameter data constraints should be specific and restrictive to provide freedom for extensions
- API producers should default to multi-cloud support when implementing features

## IPA-119: Multi-Cloud Support by Default

- API producers should default to multi-cloud support when implementing features
- API producers may support only one cloud producer at implementation and note behavior in documentation
- API producers should consider the API design in the context of all currently supported Atlas cloud partners, to avoid later rework
- API producers should prefer vendor neutral terms. For example blob storage over s3

## IPA-120: Versioning

- API producers should consider whether their changes warrant a new version or can be made backward compatible
- API producers should refer to backwards compatibility (IPA-116) prior to versioning their API
- API producers should not version their API if the desired functionality can be accomplished in a backwards compatible fashion
- API producers should consider whether to introduce a new endpoint alongside existing, in lieu of a new version
- API producers should avoid versioning an API solely to rename existing fields or paths
- API producers may coordinate to sunset old versions faster than the default timeline of one-year
- API producers must coordinate with clients to transition to new versions to avoid impact

## IPA-121: Datetime

- API producers must use ISO 8601 datetime format in UTC for all time stamps. Documentation must note datetime format for clients

## IPA-122: Standard Codes

- API producers must use ISO 3166-1-alpha-2 two-letter country code format for country data fields
- API producers must use ISO 639-1 two letter language code format for language data fields

## IPA-123: Enums

- API producers should use enumeration objects for sets of values for a field that are expected to remain relatively static. API producers may include additional documentation to include an explanation for each of the allowable fields
- API producers should default to having enums extensible to freely add more values. Enums must not be extended in a non-compatible fashion. I.e. splitting one enum value into two

## IPA-124: Repeated Fields

- Repeated fields must use a plural field name
- Repeated fields should have an enforced upper bound that will not cause a single resource payload to become too large. A good rule of thumb is 100 elements. If repeated data has the chance of being too large, the API should use a sub-resource instead
- A resource may use one of two strategies to enable updating a repeated field: Direct update using the standard Update method (A standard Update method is only able to update the entire list) or Custom Add and Remove methods (When choosing a custom method approach API consumers must not be able to set the field via Create or Update operations)

## IPA-125: Single Type in Request and Response

- API producers may use fields that contain multiple objects when request and response objects allow explicitly to set the type of the object.

## IPA-126: Top-Level API Names

- API names must be written as nouns - For example: 'Alert Configurations' not 'Configure Alerts'
- API names should be precise and self-explanatory to convey the function of the APIs
- API names should not include platform-specific branding or terms
- APIs for platform services should not include the platform name - For example: 'Atlas Search' should be displayed as 'Search'
- Discoverability through search should be considered to facilitate fast identification
- API names should avoid using acronyms unless widely recognized
- Each tag should represent a logical grouping of APIs, aligning with top-level service areas to enhance discoverability and navigation