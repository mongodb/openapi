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
[ExtensionFilter: is a filter that removes the x-xgen-IPA-exception extension from the OpenAPI spec (unless keepIPAExceptions is set in metadata).](../internal/openapi/filter/extension.go?plain=1#L21)
[HiddenEnvsFilter: is a filter that removes paths, operations,](../internal/openapi/filter/hidden_envs.go?plain=1#L28)  
[InfoVersioningFilter: Filter that modifies the Info object in the OpenAPI spec with the target version.](../internal/openapi/filter/info.go?plain=1#L23)  
[OperationsFilter: is a filter that removes the x-xgen-owner-team extension from operations.](../internal/openapi/filter/operations.go?plain=1#L20)  
[TagsFilter: removes tags that are not used in the operations.](../internal/openapi/filter/tags.go?plain=1#L23)  
[VersioningExtensionFilter: is a filter that updates the x-sunset and x-xgen-version extensions to a date string](../internal/openapi/filter/versioning_extension.go?plain=1#L25)  
[VersioningFilter: is a filter that modifies the OpenAPI spec by removing operations and responses](../internal/openapi/filter/versioning.go?plain=1#L25)  
