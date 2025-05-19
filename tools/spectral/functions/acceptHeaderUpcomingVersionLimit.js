module.exports = function (input) {
  // Get operationId from context, if this fails return an error
  const operationId = input.operationId;
  if (!operationId) {
    return;
  }

  // List of errors
  const errors = [];

  // Validate versions in 200 responses
  const responseErr = validateContent(operationId, 'response', input?.responses?.[200]?.content);
  if (responseErr != null) errors.push(responseErr);

  // Validate versions in requests
  const requestErr = validateContent(operationId, 'request', input?.requestBody?.content);
  if (requestErr != null) errors.push(requestErr);

  return errors.length > 0 ? errors : undefined;
};

// Check for upcoming API Accept headers
const upcomingRegex = /^application\/vnd\.atlas\.\d{4}-\d{2}-\d{2}\.upcoming\+.+$/;

function validateContent(operationId, section, content) {
  if (content == null) {
    return null;
  }

  const contentTypes = Object.keys(content);
  const upcomingContentTypes = contentTypes.filter((k) => upcomingRegex.test(k));
  // If there's less than or equal to one upcoming header then the operation is valid
  if (upcomingContentTypes.length <= 1) {
    return null;
  }

  // Return an error message
  return {
    message: `OperationId: ${operationId} - Found ${upcomingContentTypes.length} upcoming API Accept headers (section: ${section}): ${upcomingContentTypes.join(', ')}`,
  };
}
