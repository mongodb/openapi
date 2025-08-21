import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { getSchemaNameFromRef } from './utils/methodUtils.js';

/**
 * Verifies that 4xx and 5xx responses reference the ApiError schema
 *
 * @param {object} input - The response object to check
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const apiResponseObject = resolveObject(oas, path);
  const errorCode = path[path.length - 1];

  const errors = checkViolationsAndReturnErrors(apiResponseObject, oas, path, errorCode, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, apiResponseObject, path);
};

function checkViolationsAndReturnErrors(apiResponseObject, oas, path, errorCode, ruleName) {
  try {
    const errors = [];
    let content;

    if (apiResponseObject.content) {
      content = apiResponseObject.content;
    } else if (apiResponseObject.$ref) {
      const schemaName = getSchemaNameFromRef(apiResponseObject.$ref);
      const responseSchema = resolveObject(oas, ['components', 'responses', schemaName]);
      if (!responseSchema) {
        return [
          {
            path,
            message: `${errorCode} response must define content with a valid reference.`,
          },
        ];
      }
      content = responseSchema.content;
    } else {
      return [
        {
          path,
          message: `${errorCode} response must define content with ApiError schema reference.`,
        },
      ];
    }

    for (const [mediaType, mediaTypeObj] of Object.entries(content)) {
      if (!mediaType.endsWith('json')) {
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

      if (!schema.$ref || getSchemaNameFromRef(schema.$ref) !== 'ApiError') {
        errors.push({
          path: contentPath,
          message: `${errorCode} response must reference ApiError schema.`,
        });
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
