<!--- NOTE: This file is generated, please see /scripts/generateRulesetReadme.js --->

# IPA Validation Conditions

A condition is a named, tested yes/no question about the part of the spec a rule is looking at, such as "is a singleton resource" or "is a 2xx response". Rules built with `defineRule` list the conditions they apply to, and the "Applies to" sections in the [rules README](./README.md) link here. Each entry says what the condition is evaluated on, gives examples that match and do not match (checked by the tests), and lists the rules that use it. To change where several rules apply, change the condition once. Conditions are defined in [rulesets/functions/utils/conditions](https://github.com/mongodb/openapi/tree/main/tools/spectral/ipa/rulesets/functions/utils/conditions); to add one, see [CONTRIBUTING.md](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/CONTRIBUTING.md). Only conditions used by at least one rule are listed.

### mediaType.baseGetHasMediaType

Evaluated on: mediaType

The resource the custom method belongs to (its path without `:<name>`) has a Get method with a 200 response for the same media type as the current response.

Matches:
- `/groups/{groupId}/settings:reset post responses 200 content application/json` (the Get on /groups/{groupId}/settings has an application/json 200 response)

Does not match:
- `/groups/{groupId}/settings:reset post responses 200 content application/json` (the base resource has no Get)

Used by: [xgen-IPA-113-reset-method-response-is-get-method-response](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-response-is-get-method-response)

### mediaType.hasSchema

Evaluated on: mediaType

The media type object exists and defines a `schema`.

Matches:
- `/groups/{groupId} get responses 200 content application/json` (has a schema)

Does not match:
- `/groups/{groupId} get responses 200 content application/json` (an example but no schema)

Used by: [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource), [xgen-IPA-113-reset-method-response-is-get-method-response](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-response-is-get-method-response)

### mediaType.isJson

Evaluated on: mediaType

The media type ends in `json`, e.g. `application/vnd.atlas.2023-01-01+json`.

Matches:
- `/groups/{groupId} get responses 200 content application/vnd.atlas.2023-01-01+json`

Does not match:
- `/groups/{groupId} get responses 200 content application/vnd.atlas.2023-01-01+csv`

Used by: [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource), [xgen-IPA-113-reset-method-response-is-get-method-response](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-response-is-get-method-response)

### operation.hasCustomMethodOverride

Evaluated on: operation

The operation has an `x-xgen-method-verb-override` extension with `customMethod: true`, declaring a legacy custom method that has no `:` in its path.

Matches:
- `/groups/{groupId} get` (verb override `search` with customMethod: true)

Does not match:
- `/groups/{groupId} get` (no verb override)
- `/groups/{groupId} get` (verb override `get` with customMethod: false)

Used by: [xgen-IPA-104-operation-id-length](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-operation-id-length), [xgen-IPA-104-valid-operation-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-valid-operation-id)

### operation.hasListVerbOverride

Evaluated on: operation

The operation has an `x-xgen-method-verb-override` extension whose verb starts with `list`, declaring it a List method.

Matches:
- `/groups/{groupId} get` (verb override `listByGroup`)

Does not match:
- `/groups/{groupId} get` (verb override `get`)

Used by: [xgen-IPA-104-operation-id-length](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-operation-id-length), [xgen-IPA-104-valid-operation-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-valid-operation-id)

### operation.hasRuleMethodVerbOverride

Evaluated on: operation

The operation has an `x-xgen-method-verb-override` extension whose verb starts with the rule's `methodName` option (for IPA-104, `get`), declaring it that standard method.

Matches:
- `/groups/{groupId} get` (verb override `get`, rule methodName `get`)

Does not match:
- `/groups/{groupId} get` (no verb override, rule methodName `get`)

Used by: [xgen-IPA-104-operation-id-length](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-operation-id-length), [xgen-IPA-104-valid-operation-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-valid-operation-id)

### path.isCollection

Evaluated on: path

The path ends in a resource name: either a single top-level segment (`/groups`) or a segment following a path parameter (`/groups/{groupId}/clusters`). This is the path of a resource collection or of a singleton resource.

Matches:
- `/api/atlas/v2/groups`
- `/api/atlas/v2/groups/{groupId}/clusters`

Does not match:
- `/api/atlas/v2/groups/{groupId}`
- `/api/atlas/v2/groups/clusters`
- `/api/atlas/v2/groups:search`

Used by: [xgen-IPA-104-get-method-no-request-body](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-no-request-body), [xgen-IPA-104-get-method-response-code-is-200](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-code-is-200), [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource), [xgen-IPA-104-resource-has-GET](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-resource-has-GET), [xgen-IPA-113-reset-method-only-on-singleton-resources](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-only-on-singleton-resources), [xgen-IPA-113-singleton-must-not-have-delete-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-must-not-have-delete-method), [xgen-IPA-113-singleton-must-not-have-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-must-not-have-id), [xgen-IPA-113-singleton-should-have-update-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-should-have-update-method)

### path.isGetTarget

Evaluated on: path

The path is where a standard Get method belongs: an instance path, or the path of a singleton resource.

Defined as: any of: the path is a single resource (instance) path ([`path.isInstance`](#pathisinstance)); the path is a singleton resource ([`resource.isSingleton`](#resourceissingleton))

Matches:
- `/groups/{groupId}` (instance path)
- `/groups/{groupId}/settings` (singleton)

Does not match:
- `/groups` (collection of a standard resource)
- `/groups/settings/{name}` (not an instance path)

Used by: [xgen-IPA-104-get-method-no-request-body](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-no-request-body), [xgen-IPA-104-get-method-response-code-is-200](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-code-is-200), [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource)

### path.isInstance

Evaluated on: path

The path is a collection path (see `path.isCollection`) followed by a single path parameter, e.g. `/groups/{groupId}`. This is the path of one resource in a collection.

Matches:
- `/api/atlas/v2/groups/{groupId}`
- `/api/atlas/v2/groups/{groupId}/clusters/{clusterName}`

Does not match:
- `/api/atlas/v2/groups`
- `/api/atlas/v2/groups/{groupId}/clusters`
- `/api/atlas/v2/groups/settings/{name}`

Used by: [xgen-IPA-104-get-method-no-request-body](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-no-request-body), [xgen-IPA-104-get-method-response-code-is-200](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-code-is-200), [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource)

### path.isLegacyGetTarget

Evaluated on: path

The path ends in a path parameter (its last character is `}`), or is the path of a singleton resource. Implemented by `methodLogic.isInvalidGetMethod`.

> **Variant of [`path.isGetTarget`](#pathisgettarget).** Accepts any path ending in `}`, including ones that are not instance paths such as `/groups/settings/{name}`. Used by the IPA-104 operation ID rules; the other IPA-104 rules use `path.isGetTarget`.

Matches:
- `/groups/{groupId}` (instance path)
- `/groups/settings/{name}` (ends in a path parameter, though not an instance path)

Does not match:
- `/groups` (collection of a standard resource)

Used by: [xgen-IPA-104-operation-id-length](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-operation-id-length), [xgen-IPA-104-valid-operation-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-valid-operation-id)

### path.isResetMethod

Evaluated on: path

The path is a custom method named `reset`, e.g. `/groups/{groupId}/settings:reset`.

Matches:
- `/api/atlas/v2/groups/{groupId}/settings:reset`

Does not match:
- `/api/atlas/v2/groups/{groupId}/settings`
- `/api/atlas/v2/groups/{groupId}/settings:restart`

Used by: [xgen-IPA-113-reset-method-must-not-have-request-body](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-must-not-have-request-body), [xgen-IPA-113-reset-method-must-return-200-OK](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-must-return-200-OK), [xgen-IPA-113-reset-method-must-use-POST](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-must-use-POST), [xgen-IPA-113-reset-method-not-on-readonly-singleton](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-not-on-readonly-singleton), [xgen-IPA-113-reset-method-only-on-singleton-resources](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-only-on-singleton-resources), [xgen-IPA-113-reset-method-response-is-get-method-response](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-response-is-get-method-response), [xgen-IPA-113-reset-method-valid-operation-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-valid-operation-id)

### pathItem.hasGet

Evaluated on: pathItem

The path item defines a `get` operation.

Matches:
- `/groups/{groupId}/settings` (defines get)

Does not match:
- `/groups/{groupId}/settings` (patch only)

Used by: [xgen-IPA-113-singleton-must-not-have-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-must-not-have-id)

### resource.getResponseIsAllReadOnly

Evaluated on: resource

Every property of the 2xx response schema of the resource's Get method is `readOnly: true`. The Get on the instance path is used if there is one; otherwise the first path with a Get, which may be a List, in which case `results.items` is inspected.

Matches:
- `/groups/{groupId}/settings` (every Get response property is readOnly)

Does not match:
- `/groups/{groupId}/settings` (the Get response has a writable property)

Used by: [xgen-IPA-113-reset-method-not-on-readonly-singleton](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-not-on-readonly-singleton), [xgen-IPA-113-singleton-should-have-update-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-should-have-update-method)

### resource.hasResourceHasGetException

Evaluated on: resource

Some path item of the resource carries an `x-xgen-IPA-exception` for `xgen-IPA-104-resource-has-GET`.

Matches:
- `/groups/{groupId}/settings` (the path has the exception)

Does not match:
- `/groups/{groupId}/settings` (no exception)

Used by: [xgen-IPA-113-reset-method-not-on-readonly-singleton](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-not-on-readonly-singleton), [xgen-IPA-113-singleton-should-have-update-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-should-have-update-method)

### resource.hasSingletonShape

Evaluated on: resource

The resource's path items contain exactly one collection path, that path belongs to a parent resource (`/parent/{id}/child`), it has no Create (POST) method, and every other path is a custom method. The current path is not required to be the collection path; see `resource.isSingleton`.

Matches:
- `/groups/{groupId}/settings` (Get and Patch only)

Does not match:
- `/groups/{groupId}/clusters` (has Create and an instance path)
- `/settings` (no parent resource)

Used by: [xgen-IPA-104-get-method-no-request-body](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-no-request-body), [xgen-IPA-104-get-method-response-code-is-200](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-code-is-200), [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource), [xgen-IPA-104-resource-has-GET](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-resource-has-GET), [xgen-IPA-113-reset-method-only-on-singleton-resources](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-only-on-singleton-resources), [xgen-IPA-113-singleton-must-not-have-delete-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-must-not-have-delete-method), [xgen-IPA-113-singleton-must-not-have-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-must-not-have-id), [xgen-IPA-113-singleton-should-have-update-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-should-have-update-method)

### resource.isReadOnly

Evaluated on: resource

The resource has a Get method whose response is entirely read-only, and no path of the resource has an exception for `xgen-IPA-104-resource-has-GET`.

Defined as: all of: not: some path of the resource has an exception for `xgen-IPA-104-resource-has-GET` ([`resource.hasResourceHasGetException`](#resourcehasresourcehasgetexception)); all properties of the resource's Get response are read-only ([`resource.getResponseIsAllReadOnly`](#resourcegetresponseisallreadonly))

> **Divergence.** The exception clause is not part of the IPA definition: a resource with an IPA-104 resource-has-GET exception is never read-only, whatever its Get response looks like.

Matches:
- `/groups/{groupId}/settings` (every Get response property is readOnly)

Does not match:
- `/groups/{groupId}/settings` (the same read-only Get response, but the path has an xgen-IPA-104-resource-has-GET exception)

Used by: [xgen-IPA-113-reset-method-not-on-readonly-singleton](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-not-on-readonly-singleton), [xgen-IPA-113-singleton-should-have-update-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-should-have-update-method)

### resource.isSingleton

Evaluated on: resource

The path is a collection path and the resource it names has the singleton shape.

Defined as: all of: the path is a resource collection path ([`path.isCollection`](#pathiscollection)); the resource has the singleton shape ([`resource.hasSingletonShape`](#resourcehassingletonshape))

Matches:
- `/groups/{groupId}/settings` (singleton with a custom method)

Does not match:
- `/groups/{groupId}/settings:reset` (the custom method path of a singleton, not its collection path)

Used by: [xgen-IPA-104-get-method-no-request-body](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-no-request-body), [xgen-IPA-104-get-method-response-code-is-200](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-code-is-200), [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource), [xgen-IPA-113-reset-method-only-on-singleton-resources](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-reset-method-only-on-singleton-resources), [xgen-IPA-113-singleton-must-not-have-delete-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-must-not-have-delete-method), [xgen-IPA-113-singleton-must-not-have-id](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-must-not-have-id), [xgen-IPA-113-singleton-should-have-update-method](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-113-singleton-should-have-update-method)

### response.is2xx

Evaluated on: response

The response status code starts with `2`.

Matches:
- `/groups/{groupId} get responses 200 content application/json`
- `/groups/{groupId} get responses 202 content application/json`

Does not match:
- `/groups/{groupId} get responses 404 content application/json`

Used by: [xgen-IPA-104-get-method-response-has-no-input-fields](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-response-has-no-input-fields), [xgen-IPA-104-get-method-returns-response-suffixed-object](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-response-suffixed-object), [xgen-IPA-104-get-method-returns-single-resource](https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-104-get-method-returns-single-resource)
