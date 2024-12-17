import { isPathParam } from './utils/pathUtils';

const ERROR_MESSAGE = 'API paths must alternate between resource name and path params.';
const ERROR_RESULT = [{ message: ERROR_MESSAGE }];
const AUTH_PREFIX = "/api/atlas/v2";
const UNAUTH_PREFIX = "/api/atlas/v2/unauth"

const getPrefix = (path) => {
  if (path.includes(UNAUTH_PREFIX)) return UNAUTH_PREFIX;
  if (path.includes(AUTH_PREFIX)) return AUTH_PREFIX;
  return null;
};

const validatePathStructure = (elements) => {
  return elements.every((element, index) => {
    const isEvenIndex = index % 2 === 0;
    return isEvenIndex
      ? !isPathParam(element)
      : isPathParam(element);
  });
};

// eslint-disable-next-line no-unused-vars
export default (input, _0, _1) => {
  const prefix = getPrefix(input);
  if (!prefix) return [];

  let suffixWithLeadingSlash = input.slice(prefix.length);
  if(suffixWithLeadingSlash.length === 0) {
    return [];
  }

  let suffix = suffixWithLeadingSlash.slice(1);
  let elements = suffix.split("/");
  return validatePathStructure(elements) ? [] : ERROR_RESULT;

}
