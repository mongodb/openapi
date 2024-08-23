# Postman Collections from OpenAPI

This folder contains the code required to generate the MongoDB Atlas Postman collections from the MongoDB OpenAPI Specification. All scripts can be run locally if the environment variables for POSTMAN_API_KEY, WORKSPACE_ID, BASE_URL, and SLACK_WEBHOOK_URL are set

## Purpose of the project

Scripts allow for the generation of Postman collections from OpenAPI specifications. This allows
the [DevRel Postman workspace](https://www.postman.com/mongodb-devrel) to stay up to date with the latest version of the
API.

1. Fetching OpenAPI file
2. Converting OpenAPI file to Postman Collection
3. Updating information about the Collection
4. Uploading the Collection to Postman

## Postman folder structure

- `openapi` - Where the OpenAPI Spec, version information, and fork files are stored
- `tmp` - Where the Postman Collection is generated and the temporary working files are stored
- `scripts` - Where the Bash scripts are stored
- `validation` - Where the files for spectral validation of the generated collection is stored

## Postman Collection Generation Workflow

```mermaid
flowchart TD
    A[Fetch the OpenAPI Specification] --> B{Apply OpenAPI\nTransformations}
    B --> C[Convert to\nPostman Collection]
    C --> D[Apply JSON\ntransformations]
    D --> E[Upload Collection\nto Postman]

    style A width:160px,height:60px,text-align:center;
    style B width:160px,height:60px,text-align:center;
    style C width:160px,height:60px,text-align:center;
    style D width:160px,height:60px,text-align:center;
    style E width:160px,height:60px,text-align:center;
```

1. **Fetch the OpenAPI Specification**: Fetch the most recent version of the OpenAPI file.

2. **Apply OpenAPI transformations**: Apply transformations such as removing regex to prepare openapi file for
   conversion.

3. **Convert to Postman Collection**: Use openapi-to-postmanv2 to convert to a Postman Collection.

4. **Apply JSON transformations**: Apply transformations such as changing title, adding links, adding documentation, and preparing Collection
   for upload.

5. **Upload Collection to Postman**: Use the Postman API to upload the Collection to Postman.
