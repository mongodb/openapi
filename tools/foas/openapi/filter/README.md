# List of filters applied to the OpenAPI specification
These examples are automatically generated from filters docs.
# OpenAPI Filters
## Why filtering OpenAPI?
The Atlas Admin API OpenAPI specifications are used not only to document REST endpoints, but also to capture extra functionality such as Versioning information, team ownership, and more. This extra information is used to then correctly generate the OpenAPI respective to each version of the API.
## What is the general filter purpose?
 - Filtering per environment, so that only the endpoints that are available in that environment are shown.
 - Filtering per version, so that only the endpoints that are available in that version are shown.
## What filters are available?
### List of filters
[BumpFilter modifies includes the fields "x-state" and "x-beta" to the "preview" and "upcoming" APIs Operations.](./bump.go?plain=1#L21)  
[CodeSampleFilter modifies includes the fields "x-state" and "x-beta" to the "preview" and "upcoming" APIs Operations.](./code_sample.go?plain=1#L45)  
[ExtensionFilter is a filter that removes the x-xgen-IPA-exception extension from the OpenAPI spec.](./extension.go?plain=1#L21)  
[HiddenEnvsFilter removes paths, operations, request/response bodies and content types](./hidden_envs.go?plain=1#L30)  
[InfoVersioningFilter modifies the Info object in the OpenAPI spec with the target version.](./info.go?plain=1#L24)  
[OperationsFilter is a filter that removes the x-xgen-owner-team extension from operations.](./operations.go?plain=1#L21)  
[SchemasFilter removes unused #/components/schemas/.](./schemas.go?plain=1#L27)  
[SunsetFilter removes the sunsetToBeDecided from the openapi specification.](./sunset.go?plain=1#L26)  
[TagsFilter removes tags that are not used in the operations.](./tags.go?plain=1#L23)  
[VersioningExtensionFilter is a filter that updates the x-sunset and x-xgen-version extensions to a date string](./versioning_extension.go?plain=1#L25)  
[VersioningFilter is a filter that modifies the OpenAPI spec by removing paths, operations and responses](./versioning.go?plain=1#L25)  
