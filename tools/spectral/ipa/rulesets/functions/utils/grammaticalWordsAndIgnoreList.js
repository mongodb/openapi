/**
 * Shared configuration for title case validation lists used across IPA-126 and IPA-117 rules.
 * These lists are used by the isTitleCase() function to validate proper title casing.
 */

// IPA-126: Tag Names Should Use Title Case
export const IPA_126_IGNORE_LIST = ['AI', 'AWS', 'DNS', 'API', 'IP', 'MCP', 'MongoDB', 'LDAP', 'GCP', 'OpenAPI'];

export const IPA_126_GRAMMATICAL_WORDS = [
  'and',
  'or',
  'to',
  'in',
  'as',
  'for',
  'of',
  'with',
  'by',
  'but',
  'the',
  'a',
  'an',
];

// IPA-117: Documentation Rules - Operation Summary Format
export const IPA_117_IGNORE_LIST = [
  'ID',
  'IDs',
  'MongoDB',
  'OpenAPI',
  'API',
  'AI',
  'AWS',
  'GCP',
  'IP',
  'CIDR',
  'DNS',
  'LDAP',
  'OIDC',
  'JWKS',
  'X.509',
  'M2',
  'M5',
  'RAM',
  'LTS',
  'MCP',
  'VPC',
  'DN',
  'CSV',
];

export const IPA_117_GRAMMATICAL_WORDS = [
  'and',
  'or',
  'to',
  'in',
  'as',
  'for',
  'of',
  'with',
  'by',
  'but',
  'the',
  'a',
  'an',
  'from',
  'at',
  'into',
  'via',
  'on',
];
