// The violation is applied only to deprecated objects (parameters and schemas/schema properties
// selected by the rule's `given` paths) that meet ALL of the following:
//   - the object is marked `deprecated: true`, and
//   - the object has a `description`, and
//   - that description does not start with "Deprecated: " (capital D, colon, space).
// It is NOT applied to:
//   - non-deprecated objects (`deprecated` missing or false),
//   - deprecated objects without a description (nothing would be copied into generated code),
//   - deprecated operations, which are out of scope for this rule.
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
