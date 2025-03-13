import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { isEqual } from 'lodash';
import omitDeep from 'omit-deep-lodash';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getResponseOfGetMethodByMediaType } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-get-method-response';
const ERROR_MESSAGE =
  'The request body schema properties must match the response body schema properties of the Get method.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  let mediaType = input;
  if (isCustomMethodIdentifier(resourcePath) || !mediaType.endsWith('json')) {
    return;
  }

  const getMethodResponseContentPerMediaType = getResponseOfGetMethodByMediaType(mediaType, resourcePath, oas);
  if (!getMethodResponseContentPerMediaType || !getMethodResponseContentPerMediaType.schema) {
    return;
  }

  const postMethodRequestContentPerMediaType = resolveObject(oas, path);
  if (!postMethodRequestContentPerMediaType.schema) {
    return;
  }
  if (hasException(postMethodRequestContentPerMediaType, RULE_NAME)) {
    collectException(postMethodRequestContentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(
    path,
    postMethodRequestContentPerMediaType,
    getMethodResponseContentPerMediaType
  );

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(
  path,
  postMethodRequestContentPerMediaType,
  getMethodResponseContentPerMediaType
) {
  const errors = [];

  if (
    !isEqual(
      omitDeep(postMethodRequestContentPerMediaType.schema, 'readOnly', 'writeOnly'),
      omitDeep(getMethodResponseContentPerMediaType.schema, 'readOnly', 'writeOnly')
    )
  ) {
    errors.push({
      path: path,
      message: ERROR_MESSAGE,
    });
  }

  return errors;
}
