const PATH_PREFIX = '/api/atlas/v2/';
const lowerCasePattern = new RegExp('^[a-z]+$');

// Method should be get, delete, update or create
export function generateOperationIdForStandardMethod(path, method) {
  let remainingPath = removePathPrefix(path).split('/');

  // Start with the method, for example, 'get' or 'list'
  let operationId = method;

  // Add the rest of the words from the path
  operationId += getOperationIdFromPathSections(remainingPath);

  return operationId;
}

export function generateOperationIdForCustomMethod(path) {
  const resourcePath = path.split(':')[0];
  const customMethodName = path.split(':')[1];

  let remainingPath = removePathPrefix(resourcePath).split('/');
  let operationId = '';

  // Get custom verb to start the operationId
  // invite -> invite
  // addNode -> add
  let customVerb;
  let remainingCustomMethodName = '';
  if (lowerCasePattern.test(customMethodName)) {
    customVerb = customMethodName;
  } else {
    customVerb = getFirstWordFromCamelCase(customMethodName);
    remainingCustomMethodName = customMethodName.substring(customVerb.length);
  }
  operationId += customVerb;

  operationId += getOperationIdFromPathSections(remainingPath);

  // Add any remaining words from the custom name to the end
  // /orgs/{orgId}/users/{userId}:addRole -> add + Org + User + Role
  operationId += remainingCustomMethodName;

  return operationId;
}

function getOperationIdFromPathSections(remainingPath) {
  // Get resource names along the path and add to operationId
  // /orgs/{orgId}/users/{userId} -> Org + User
  // /groups/{groupId}/flexCluster -> Group + FlexCluster
  let operationId = '';
  while (remainingPath.length > 0) {
    const { nextWord, strippedPath } = getWordFromNextResource(remainingPath);
    operationId += capitalizeFirstLetter(nextWord);
    remainingPath = strippedPath;
  }
  return operationId;
}

function getWordFromNextResource(pathSections) {
  // If there is a parent + child
  if (pathSections.length > 1 && !pathSections[0].startsWith('{') && pathSections[1].startsWith('{')) {
    const parentResource = pathSections[0];
    // If parent ant specifier does not start the same way, return both
    // For example ServiceAccounts + Client
    const specifier = getResourceNameFromResourceSpecifier(pathSections[1]);
    if (specifier === 'id' || specifier === 'hostname' || specifier === 'username' || specifier === 'name') {
      const strippedPath = pathSections.slice(2);
      return { nextWord: parentResource, strippedPath };
    }
    if (!parentResource.startsWith(specifier)) {
      if (specifier.endsWith('ation') && parentResource.startsWith(specifier.substring(0, specifier.length - 5))) {
        const nextWord = specifier;
        const strippedPath = pathSections.slice(2);
        return { nextWord, strippedPath };
      }
      const nextWord = parentResource + capitalizeFirstLetter(specifier);
      const strippedPath = pathSections.slice(2);
      return { nextWord, strippedPath };
    }
    // If parent and specifier starts the same way, for example org + orgId
    // Return only specifier, in this case org
    const nextWord = specifier;
    const strippedPath = pathSections.slice(2);
    return { nextWord, strippedPath };
  }
  // If next path is a child, strip brackets and return resource name from specifier
  if (pathSections[0].startsWith('{')) {
    return {
      nextWord: getResourceNameFromResourceSpecifier(pathSections[0]),
      strippedPath: pathSections.slice(1),
    };
  }
  // Else, just return next word
  return {
    nextWord: pathSections[0],
    strippedPath: pathSections.slice(1),
  };
}

/**
 * Returns the resource name from a resource specifier.
 * For example, '{orgId}' returns 'org', 'apiUserId' returns 'apiUser', '{logName}.gz' returns 'log'
 *
 * @param resourceSpecifier the resource specifier, including brackets
 * @returns {string} the resource name derived from the specifier
 */
function getResourceNameFromResourceSpecifier(resourceSpecifier) {
  let string = resourceSpecifier;
  if (resourceSpecifier.includes('.')) {
    string = resourceSpecifier.split('.')[0];
  }
  const strippedFromBrackets = stripStringFromBrackets(string);
  if (lowerCasePattern.test(strippedFromBrackets)) {
    return strippedFromBrackets;
  }
  return removeLastWordFromCamelCase(strippedFromBrackets);
}

/**
 * Strips a string from surrounding curly brackets, if there are no brackets the function just returns the string.
 *
 * @param string the string to remove the curly brackets from
 * @returns {string} the string without the brackets
 */
function stripStringFromBrackets(string) {
  if (string.startsWith('{') && string.endsWith('}')) {
    return string.substring(1, string.length - 1);
  }
  return string;
}

/**
 * Returns the first word from a camelCase string, for example, 'camelCase' returns 'camel'.
 *
 * @param string the string to get the first word from
 * @returns {string} the first word from the passed string
 */
function getFirstWordFromCamelCase(string) {
  return string.split(/(?=[A-Z])/)[0];
}

/**
 * Removed the last word from a camelCase string, for example, 'camelCaseWord' returns 'camelCase'.
 *
 * @param string the string to get the first word from
 * @returns {string} the first word from the passed string
 */
function removeLastWordFromCamelCase(string) {
  const words = string.split(/(?=[A-Z][^A-Z]+$)/);
  return words.slice(0, words.length - 1).join();
}

/**
 * Capitalizes the first letter in a string.
 *
 * @param string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function removePathPrefix(path) {
  if (path.startsWith(PATH_PREFIX)) {
    return path.split(PATH_PREFIX)[1];
  } else {
    console.error('There is another prefix', path);
    return path;
  }
}
