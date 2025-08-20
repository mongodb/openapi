import { getSchemaRef } from '../methodUtils.js';
import { handleInternalError } from '../collectionUtils.js';

/**
 * Checks if a request or response content for a media type references a schema with a specific suffix.
 * Returns errors if the schema doesn't reference a schema, or if the schema name does not end with the expected suffix.
 * Ready to be used in a custom validation function.
 *
 * @param {string[]} path the path to the object being evaluated
 * @param {object} contentPerMediaType the content to evaluate for a specific media type (unresolved)
 * @param {string} expectedSuffix the expected suffix to evaluate the schema name for
 * @param {string} ruleName the rule name
 * @returns {[{path, message: string}]} the errors found, or an empty array in case of no errors
 */
export function checkSchemaRefSuffixAndReturnErrors(path, contentPerMediaType, expectedSuffix, ruleName) {
  try {
    const schema = contentPerMediaType.schema;
    const schemaRef = getSchemaRef(schema);

    if (!schemaRef) {
      return [
        {
          path,
          message: 'The schema is defined inline and must reference a predefined schema.',
        },
      ];
    }
    if (!schemaRef.endsWith(expectedSuffix)) {
      return [
        {
          path,
          message: `The schema must reference a schema with a ${expectedSuffix} suffix.`,
        },
      ];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
