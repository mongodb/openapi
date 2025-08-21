import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { pathIsForRequestVersion, pathIsForResponseVersion } from './utils/componentUtils.js';
import { schemaIsObject } from './utils/schemaUtils.js';

const ERROR_MESSAGE =
  'Components of type "object" must be well-defined with for example a schema, example(s) or properties.';

/**
 * The rule checks components of `type: 'object'` for the presence of one of the properties:
 * `schema`, `examples`, `example`, `oneOf`, `anyOf`, `allOf`, `properties` or `additionalProperties`.
 *
 * @param input the component to evaluate
 * @param {string[]} ignoredPaths paths to ignore, for example: 'components.schemas.MySchema'
 * @param path the path to the component being evaluated
 * @param rule the Spectral rule under validation
 */
export default (input, { ignoredPaths }, { path, rule }) => {
  const ruleName = rule.name;
  // Ignore paths that match the passed ignoredPaths
  const joinedPath = path.join('.');
  if (ignoredPaths.some((ignoredPath) => ignoredPath === joinedPath)) {
    return;
  }

  // Ignore types other than object
  if (!schemaIsObject(input)) {
    return;
  }

  // Ignore non-JSON requests
  if (pathIsForRequestVersion(path) && !path[5].endsWith('json')) {
    return;
  }

  // Ignore non-JSON responses
  if (pathIsForResponseVersion(path) && !path[6].endsWith('json')) {
    return;
  }

  // Ignore references
  if (input['$ref']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(object, path, ruleName) {
  try {
    const validProperties = [
      'schema',
      'example',
      'examples',
      'allOf',
      'anyOf',
      'oneOf',
      'properties',
      'additionalProperties',
    ];
    if (Object.keys(object).some((key) => validProperties.includes(key))) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
