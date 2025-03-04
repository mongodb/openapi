import {
  getResourceCollectionIdentifier,
  getResourcePaths,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
  isStandardResource,
} from './utils/resourceEvaluation.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getAllSuccessfulResponseSchemas } from './utils/methodUtils.js';
import { hasException } from './utils/exceptions.js';
import { schemaIsArray, schemaIsPaginated } from './utils/schemaUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-104-get-method-returns-single-resource';
const ERROR_MESSAGE_STANDARD_RESOURCE =
  'Get methods should return data for a single resource. This method returns an array or a paginated response.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (
    (isSingleResourceIdentifier(resourcePath) &&
      isStandardResource(getResourcePaths(getResourceCollectionIdentifier(resourcePath), Object.keys(oas.paths)))) ||
    (isResourceCollectionIdentifier(resourcePath) &&
      isSingletonResource(getResourcePaths(resourcePath, Object.keys(oas.paths))))
  ) {
    const errors = [];

    const responseSchemas = getAllSuccessfulResponseSchemas(input);
    responseSchemas.forEach(({ schemaPath, schema }) => {
      const fullPath = path.concat(schemaPath);
      const responseObject = resolveObject(oas, fullPath);

      if (hasException(responseObject, RULE_NAME)) {
        collectException(responseObject, RULE_NAME, fullPath);
      } else if (schemaIsPaginated(schema) || schemaIsArray(schema)) {
        collectAndReturnViolation(fullPath, RULE_NAME, ERROR_MESSAGE_STANDARD_RESOURCE);
        errors.push({
          path: fullPath,
          message: ERROR_MESSAGE_STANDARD_RESOURCE,
        });
      } else {
        collectAdoption(fullPath, RULE_NAME);
      }
    });

    return errors;
  }
};
