import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { getSchemaNameFromRef } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-114-error-responses-refer-to-api-error';

/**
 * Verifies that 4xx and 5xx responses reference the ApiError schema
 *
 * @param {object} input - The response object to check
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path, documentInventory }) => {
  try {
    const oas = documentInventory.unresolved;
    const apiResponseObject = resolveObject(oas, path);
    const errorCode = path[path.length - 1];

    // Check for exception at response level
    if (hasException(apiResponseObject, RULE_NAME)) {
      collectException(apiResponseObject, RULE_NAME, path);
      return;
    }

    const errors = checkViolationsAndReturnErrors(apiResponseObject, oas, path, errorCode);
    if (errors.length !== 0) {
      return collectAndReturnViolation(path, RULE_NAME, errors);
    }

    collectAdoption(path, RULE_NAME);
  } catch(e) {
    handleInternalError(RULE_NAME, path, e);
    console.log(e);
  }

};

function checkViolationsAndReturnErrors(apiResponseObject, oas, path, errorCode) {
  try {
    const errors = [];
    let content;

    if (apiResponseObject.content) {
      content = apiResponseObject.content;
    } else if (apiResponseObject.$ref) {
      const schemaName = getSchemaNameFromRef(apiResponseObject.$ref);
      const responseSchema = resolveObject(oas, ['components', 'responses', schemaName]);
      content = responseSchema.content;
    } else {
      return [{ path, message: `${errorCode} response must define content with ApiError schema reference.` }];
    }

    for (const [mediaType, mediaTypeObj] of Object.entries(content)) {
      if (!mediaType.endsWith('json')) {
        continue;
      }

      if (hasException(mediaTypeObj, RULE_NAME)) {
        collectException(mediaTypeObj, RULE_NAME, [...path, 'content', mediaType]);
        continue;
      }

      const contentPath = [...path, 'content', mediaType];

      // Check if schema exists
      if (!mediaTypeObj.schema) {
        errors.push({
          path: contentPath,
          message: `${errorCode} response must define a schema referencing ApiError.`,
        });
        continue;
      }

      // Check if schema references ApiError
      const schema = mediaTypeObj.schema;

      if (!schema.$ref || !schema.$ref.endsWith('/ApiError')) {
        errors.push({
          path: contentPath,
          message: `${errorCode} response must reference ApiError schema.`,
        });
      }
    }
    return errors;
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
