import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-114-api-error-has-bad-request-detail';

/**
 * Verifies that ApiError schema has badRequestDetail field with proper structure
 *
 * @param {object} input - The ApiError schema object
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path, documentInventory }) => {
  const errors = checkViolationsAndReturnErrors(input, documentInventory, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

/**
 * Check for violations in ApiError schema structure
 *
 * @param {object} apiErrorSchema - The ApiError schema object to validate
 * @param {object} documentInventory - Contains document information
 * @param {Array} path - Path to the schema in the document
 * @returns {Array} - Array of error objects
 */
function checkViolationsAndReturnErrors(apiErrorSchema, documentInventory, path) {
  try {
    // ApiError should have badRequestDetail property
    if (!apiErrorSchema.properties?.badRequestDetail) {
      return [
        {
          path,
          message: 'ApiError schema must have badRequestDetail field.',
        },
      ];
    }

    //badRequestDetail must include an array of fields
    const badRequestDetail = apiErrorSchema.properties.badRequestDetail;
    if (badRequestDetail.properties?.fields?.type !== 'array') {
      return [
        {
          path,
          message: 'badRequestDetail must include an array of fields.',
        },
      ];
    }

    //Each field must include description and field properties
    const fields = badRequestDetail.properties.fields;
    if (!fields.items?.properties?.description && !fields.items?.properties?.field) {
      return [
        {
          path,
          message: 'Each field must include description and field properties.',
        },
      ];
    }

    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
