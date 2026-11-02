const DEPRECATED_PREFIX = 'Deprecated: ';
const MAX_DESCRIPTION_PREVIEW_LENGTH = 80;

module.exports = function (input) {
  if (input?.deprecated !== true) {
    return;
  }

  const { description } = input;
  if (typeof description !== 'string' || description.startsWith(DEPRECATED_PREFIX)) {
    return;
  }

  const preview =
    description.length > MAX_DESCRIPTION_PREVIEW_LENGTH
      ? `${description.slice(0, MAX_DESCRIPTION_PREVIEW_LENGTH)}...`
      : description;

  return [
    {
      message: `Description of a deprecated parameter or schema must start with "${DEPRECATED_PREFIX}" but was: "${preview}"`,
    },
  ];
};
