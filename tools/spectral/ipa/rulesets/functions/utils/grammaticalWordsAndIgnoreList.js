/**
 * Shared configuration for title case validation lists used across IPA-126 and IPA-117 rules.
 * These lists are used by the isTitleCase() function to validate proper title casing.
 */

export const IGNORE_LIST = [
  'AI',
  'API',
  'AWS',
  'CIDR',
  'CSV',
  'DN',
  'DNS',
  'GCP',
  'ID',
  'IDs',
  'IP',
  'JWKS',
  'LDAP',
  'LTS',
  'M2',
  'M5',
  'MCP',
  'MongoDB',
  'OIDC',
  'OpenAPI',
  'RAM',
  'VPC',
  'X.509',
];

export const GRAMMATICAL_WORDS = [
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'in',
  'into',
  'of',
  'on',
  'or',
  'the',
  'to',
  'via',
  'with',
];
