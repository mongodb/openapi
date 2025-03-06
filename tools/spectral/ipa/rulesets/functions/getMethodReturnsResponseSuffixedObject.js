import {
  isSingleResourceIdentifier,
  isCustomMethodIdentifier,
  isSingletonResource,
  getResourcePathItems,
} from './utils/resourceEvaluation.js';
import { getAllSuccessfulResponseSchemaNames } from './utils/methodUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-104-get-method-returns-response-suffixed-object';
const ERROR_MESSAGE = 'schema name should end in "Response".';

export default (input, _, { path, document }) => {
  const resourcePath = path[1];
  const oas = document.data;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    isCustomMethodIdentifier(resourcePath) ||
    (!isSingleResourceIdentifier(resourcePath) && !isSingletonResource(resourcePaths))
  ) {
    return;
  }

  const errors = [];

  const responseSchemaNames = getAllSuccessfulResponseSchemaNames(oas.paths[resourcePath].get);
  responseSchemaNames.forEach(({ schemaName, schemaPath }) => {
    const fullPath = path.concat(schemaPath);
    const responseObject = resolveObject(oas, fullPath);

    if (hasException(responseObject, RULE_NAME)) {
      collectException(responseObject, RULE_NAME, fullPath);
    } else if (!schemaName.endsWith('Response')) {
      collectAndReturnViolation(fullPath, RULE_NAME, `${schemaName} ${ERROR_MESSAGE}`);
      errors.push({
        path: fullPath,
        message: `${schemaName} ${ERROR_MESSAGE}`,
      });
    } else {
      collectAdoption(fullPath, RULE_NAME);
    }
  });

  return errors;
};
