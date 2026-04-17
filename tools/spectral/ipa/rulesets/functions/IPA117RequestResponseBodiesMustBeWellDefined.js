import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride } from './utils/extensions.js';
import { isEmpty, resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE = 'Request and response bodies must be well-defined, i.e. include a schema or example(s).';

/**
 * The rule checks request and response bodies for the presence of one of the properties:
 * `schema`, `examples`, `example`, `oneOf`, `anyOf`, `allOf`, `properties` or `$ref`.
 *
 * @param input the component to evaluate
 * @param opts optional rule options, not used in this rule
 * @param path the path to the component being evaluated
 * @param documentInventory the document inventory containing the resolved and unresolved OpenAPI Specification
 * @param rule the Spectral rule under validation
 */
export default (input, opts, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const unresolvedOas = documentInventory.unresolved;
  const httpPath = path[1];
  const httpMethod = path[2];
  const httpResponseCode = path[3] === 'responses' ? path[4] : null;
  const operationIsCustomMethod = isCustomMethod(httpPath, httpMethod, unresolvedOas);

  // Ignore:
  // 202 responses
  // DELETE 2xx responses
  // Custom POST method request bodies
  // Custom POST method 2xx responses
  if (
    httpResponseCode === '202' ||
    (httpMethod === 'delete' && httpResponseCode.startsWith('2')) ||
    (operationIsCustomMethod && httpMethod === 'post' && httpResponseCode?.startsWith('2'))
  ) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(object, path, ruleName) {
  try {
    if (!object || Object.keys(object).length === 0) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    const validProperties = ['schema', 'example', 'examples', 'allOf', 'anyOf', 'oneOf', 'properties', '$ref'];
    if (validProperties.filter((key) => !isEmpty(object[key])).length > 0) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}

/**
 * Checks if the endpoint is a custom method based on the path format or the custom method flag in the `x-xgen-method-verb-override` extension
 *
 * @param httpPath the HTTP path of the endpoint
 * @param httpMethod the HTTP method of the endpoint
 * @param unresolvedOas the unresolved OpenAPI Specification defining the endpoint
 * @returns {boolean} true if the endpoint is a custom method, false otherwise
 */
function isCustomMethod(httpPath, httpMethod, unresolvedOas) {
  return (
    isCustomMethodIdentifier(httpPath) ||
    hasCustomMethodOverride(resolveObject(unresolvedOas, ['paths', httpPath, httpMethod]))
  );
}
