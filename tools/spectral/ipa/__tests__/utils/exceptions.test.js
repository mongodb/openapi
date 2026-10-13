import { describe, expect, it } from '@jest/globals';
import { findExceptionInParentSchema, hasException } from '../../rulesets/functions/utils/exceptions';

const TEST_RULE_NAME_100 = 'xgen-IPA-100';

const objectWithIpa100Exception = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-100': 'reason',
  },
};

const objectWithNestedIpa100Exception = {
  get: {
    'x-xgen-IPA-exception': {
      'xgen-IPA-100': 'reason',
    },
  },
};

const objectWithIpa100ExceptionAndOwnerExtension = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-100': 'reason',
  },
  'x-xgen-owner-team': 'apix',
};

const objectWithIpa101Exception = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-101': 'reason',
  },
};

const objectWithIpa100And101Exception = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-101': 'reason',
    'xgen-IPA-100': 'reason',
  },
};

describe('tools/spectral/ipa/rulesets/functions/utils/exceptions.js', () => {
  describe('hasException', () => {
    it('returns true if object has exception matching the rule name', () => {
      expect(hasException(objectWithIpa100Exception, TEST_RULE_NAME_100)).toBe(true);
      expect(hasException(objectWithIpa100ExceptionAndOwnerExtension, TEST_RULE_NAME_100)).toBe(true);
      expect(hasException(objectWithIpa100And101Exception, TEST_RULE_NAME_100)).toBe(true);
    });
    it('returns false if object does not have exception matching the rule name', () => {
      expect(hasException({}, TEST_RULE_NAME_100)).toBe(false);
      expect(hasException(objectWithIpa101Exception, TEST_RULE_NAME_100)).toBe(false);
    });
    it('returns false if object has nested exception matching the rule name', () => {
      expect(hasException(objectWithNestedIpa100Exception, TEST_RULE_NAME_100)).toBe(false);
    });
  });
  describe('findExceptionInParentSchema', () => {
    const oas = {
      components: {
        schemas: {
          SchemaWithException: {
            ...objectWithIpa100Exception,
            properties: {
              field: {},
              fieldWithException: { ...objectWithIpa100Exception },
            },
          },
          SchemaWithoutException: {
            properties: {
              field: {},
            },
          },
        },
      },
    };

    it('returns the schema if the parent schema has an exception', () => {
      const path = ['components', 'schemas', 'SchemaWithException', 'properties', 'field'];
      expect(findExceptionInParentSchema(oas, {}, path, TEST_RULE_NAME_100)).toEqual({
        schema: oas.components.schemas.SchemaWithException,
      });
    });
    it('returns an error if both the property and the parent schema have an exception', () => {
      const path = ['components', 'schemas', 'SchemaWithException', 'properties', 'fieldWithException'];
      expect(findExceptionInParentSchema(oas, objectWithIpa100Exception, path, TEST_RULE_NAME_100)).toEqual({
        error: [
          {
            path: [...path, 'x-xgen-IPA-exception', TEST_RULE_NAME_100],
            message:
              'This component is covered by an exception on its containing schema and does not need its own exception. Please remove the exception.',
          },
        ],
      });
    });
    it('returns the schema if the property is undefined and the parent schema has an exception', () => {
      const path = ['components', 'schemas', 'SchemaWithException', 'properties', 'field'];
      expect(findExceptionInParentSchema(oas, undefined, path, TEST_RULE_NAME_100)).toEqual({
        schema: oas.components.schemas.SchemaWithException,
      });
    });
    it('returns null if the parent schema does not have an exception', () => {
      const path = ['components', 'schemas', 'SchemaWithoutException', 'properties', 'field'];
      expect(findExceptionInParentSchema(oas, {}, path, TEST_RULE_NAME_100)).toBeNull();
      expect(findExceptionInParentSchema(oas, {}, path, 'xgen-IPA-101')).toBeNull();
    });
    it('returns null if the path does not point to a schema property', () => {
      expect(findExceptionInParentSchema(oas, {}, ['components', 'schemas'], TEST_RULE_NAME_100)).toBeNull();
    });
  });
});
