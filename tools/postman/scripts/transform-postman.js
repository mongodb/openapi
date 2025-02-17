import fs from 'fs';
import path from 'path';
import _ from 'lodash';

/**
# Prepare collection for Postman API
# Environment variables:
#   COLLECTION_FILE_NAME - name of the postman collection file
#   COLLECTION_TRANSFORMED_FILE_NAME - name of the transformed collection file
#   OPENAPI_FILE_NAME - name of the openapi specification file
#   OPENAPI_FOLDER - folder where openapi file is saved
#   TMP_FOLDER - folder for temporary files during transformations
#   VERSION_FILE_NAME - name of the file where the current version is stored
#   DESCRIPTION_FILE - name for the markdown description file
#   TOGGLE_INCLUDE_BODY - bool for if generated bodies should be removed or kept
#   TOGGLE_ADD_DOCS_LINKS - updates requests with corresponding docs links
#   TOKEN_URL_ENV - client credentials auth path to set at the environment level, will not be set if unpopulated
#   BASE_URL - the default base url the Postman Collection will use
 */
const COLLECTION_FILE_NAME = process.env.COLLECTION_FILE_NAME || 'collection.json';
const COLLECTION_TRANSFORMED_FILE_NAME = process.env.COLLECTION_TRANSFORMED_FILE_NAME || 'collection-transformed.json';
const OPENAPI_FILE_NAME = process.env.OPENAPI_FILE_NAME || 'atlas-api.json';
const OPENAPI_FOLDER = process.env.OPENAPI_FOLDER || './openapi';
const TMP_FOLDER = process.env.TMP_FOLDER || './tmp';
const VERSION_FILE_NAME = process.env.VERSION_FILE_NAME || 'version.txt';
const DESCRIPTION_FILE = process.env.DESCRIPTION_FILE || './collection-description.md';
const TOGGLE_INCLUDE_BODY = process.env.TOGGLE_INCLUDE_BODY !== 'false';
const TOGGLE_ADD_DOCS_LINKS = process.env.TOGGLE_ADD_DOCS_LINKS === 'true';
const TOKEN_URL_ENV = process.env.TOKEN_URL_ENV || '';
const BASE_URL = process.env.BASE_URL || '';

// Dedicated transformation for postman collection.json file.
const transform = () => {
  const currentApiRevision = fs.readFileSync(path.join(OPENAPI_FOLDER, VERSION_FILE_NAME), 'utf8').trim();
  let collection = loadJsonFile(path.join(TMP_FOLDER, COLLECTION_FILE_NAME));

  console.log(`Wrapping Collection ${COLLECTION_FILE_NAME} in "collection" tag`);
  collection = { collection };

  console.log('Disabling query params by default');
  _.forEach(collection.collection.item, (item) => {
    if (item.request && item.request.url && Array.isArray(item.request.url.query)) {
      item.request.url.query.forEach((query) => {
        query.disabled = true;
      });
    }
  });

  console.log('Removing _postman_id');
  delete collection.collection.info._postman_id;

  console.log('Removing circular references');
  const collectionString = JSON.stringify(collection);
  const cleanedCollectionString = removeCircularReferences(collectionString);
  collection = JSON.parse(cleanedCollectionString);

  console.log(`Updating name with version ${currentApiRevision}`);
  collection.collection.info.name = `MongoDB Atlas Administration API ${currentApiRevision}`;

  console.log('Adding Collection description');
  const description = fs.readFileSync(DESCRIPTION_FILE, 'utf8').trim();
  _.set(collection, 'collection.info.description.content', description);

  console.log('Removing all variables. We use environment for variables instead');
  collection.collection.variable = [];

  console.log(`Adding baseUrl property ${BASE_URL}`);
  collection.collection.variable.push({ key: 'baseUrl', value: BASE_URL });

  if (TOGGLE_ADD_DOCS_LINKS) {
    console.log('Adding links to docs for each request');

    const openapiContent = loadJsonFile(path.join(OPENAPI_FOLDER, OPENAPI_FILE_NAME));
    const paths = _.keys(openapiContent.paths);

    paths.forEach((pathKey) => {
      const methods = _.keys(openapiContent.paths[pathKey]);
      methods.forEach((method) => {
        const requestInfo = openapiContent.paths[pathKey][method];
        const title = requestInfo.summary;
        const operationId = requestInfo.operationId;
        const tag = _.kebabCase(requestInfo.tags[0]);

        const url = `https://mongodb.com/docs/atlas/reference/api-resources-spec/v2/#tag/${tag}/operation/${operationId}`;

        const requestItem = _.find(_.flatten(collection.collection.item.map((i) => i.item)), { name: title });
        if (requestItem && requestItem.description && requestItem.description.content) {
          requestItem.description.content += `\n\nFind out more at ${url}`;
        }
      });
    });
  }

  if (!TOGGLE_INCLUDE_BODY) {
    console.log('Removing generated bodies');
    _.forEach(_.flatten(collection.collection.item.map((i) => i.item)), (item) => {
      if (item.response) {
        item.response.forEach((response) => {
          response.body = '';
        });
        item.request.body = {};
      }
    });
  }

  if (TOKEN_URL_ENV) {
    console.log(`Adding client credentials auth url variable ${TOKEN_URL_ENV}`);
    collection.collection.variable.push({ key: 'clientCredentialsTokenUrl', value: TOKEN_URL_ENV });
  }

  saveJsonFile(path.join(TMP_FOLDER, COLLECTION_TRANSFORMED_FILE_NAME), collection);

  console.log('Transformation complete');
};

function loadJsonFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function saveJsonFile(filePath, json) {
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
}

// hack
function removeCircularReferences(jsonStr) {
  return jsonStr.replace(/\\"value\\": \\"<Circular reference to #[^>"]* detected>\\"/g, '');
}

transform();
