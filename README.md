# MongoDB Atlas Administration API OpenAPI Specification 3.0
[![OpenAPI (jp)](https://img.shields.io/badge/openapi-click%20to%20preview-rgb(71%2C162%2C72)?style=for-the-badge&logo=mongodb)](https://htmlpreview.github.io/?https://github.com/mongodb/openapi/blob/main/openapi/branded-preview.html)
[![GO SDK (jp)](https://img.shields.io/badge/GO%20SDK-click%20to%20open-rgb(21%2C151%2C183)?style=for-the-badge&logo=go)](https://github.com/mongodb/atlas-sdk-go)
[![Postman (jp)](https://img.shields.io/badge/Postman-click%20to%20open-rgb(239%2C91%2C37)?style=for-the-badge&logo=postman)](https://www.postman.com/mongodb-devrel/workspace/mongodb-atlas-administration-apis/overview)

This repository hosts the OpenAPI specification for the [Atlas Administration API (v2.0)](https://www.mongodb.com/docs/atlas/reference/api-resources-spec/v2/).



## Tools
This repository also contains tools for validating, generating, and distributing OpenAPI specifications.
### FoasCLI
The [tools/cli](tools/cli) directory hosts a Go-based CLI tool used to merge multiple OpenAPI specifications into a single federated specification, which is used for the Admin APIs. 

For more details, please refer to the [CLI’s README.md](tools/cli/README.md).

### Spectral
The [tools/spectral](tools/spectral) directory contains MongoDB-specific [Spectral](https://github.com/stoplightio/spectral) rule definitions.
These rules are used to validate that the generated OpenAPI specifications comply with MongoDB’s guidelines.

For more details, please refer to the [Spectral’s README.md](tools/spectral/README.md).


### Postman
The [tools/postman](tools/postman) directory contains the logic required to generate the [MongoDB Atlas Postman collections](https://www.postman.com/mongodb-devrel?tab=collections).

For more details, please refer to the [Spectral’s README.md](tools/postman/README.md).



## Contributing
See our [CONTRIBUTING.md](../../CONTRIBUTING.md) guide.
