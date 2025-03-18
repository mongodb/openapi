// schemaUtils.test.js
import { checkForbiddenPropertyAttributesAndReturnErrors } from '../../rulesets/functions/utils/validations.js';
import { describe, expect, it } from '@jest/globals';

describe('tools/spectral/ipa/rulesets/functions/utils/validations.js', () => {
  describe('checkForbiddenPropertyAttributesAndReturnErrors', () => {
    const mockPath = ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'];
    const errorMessage = 'Test error message';

    it('handles primitive values', () => {
      expect(checkForbiddenPropertyAttributesAndReturnErrors(null, 'readOnly', mockPath, [], errorMessage)).toEqual([]);
      expect(
        checkForbiddenPropertyAttributesAndReturnErrors(undefined, 'readOnly', mockPath, [], errorMessage)
      ).toEqual([]);
      expect(checkForbiddenPropertyAttributesAndReturnErrors('string', 'readOnly', mockPath, [], errorMessage)).toEqual(
        []
      );
      expect(checkForbiddenPropertyAttributesAndReturnErrors(123, 'readOnly', mockPath, [], errorMessage)).toEqual([]);
      expect(checkForbiddenPropertyAttributesAndReturnErrors(true, 'readOnly', mockPath, [], errorMessage)).toEqual([]);
    });

    it('detects direct attribute match', () => {
      const schema = {
        type: 'string',
        readOnly: true,
      };

      const errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        path: mockPath,
        message: `${errorMessage} Found readOnly property at one of the inline schemas.`,
      });
    });

    it('detects properties with the specified attribute', () => {
      const schema = {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            readOnly: true,
          },
          name: {
            type: 'string',
          },
          password: {
            type: 'string',
            writeOnly: true,
          },
        },
      };

      // Testing readOnly detection
      let errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Found readOnly property at: id.');

      // Testing writeOnly detection
      errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'writeOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Found writeOnly property at: password.');
    });

    it('detects nested properties with the specified attribute', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                readOnly: true,
              },
              credentials: {
                type: 'object',
                properties: {
                  password: {
                    type: 'string',
                    writeOnly: true,
                  },
                },
              },
            },
          },
        },
      };

      // Testing deep readOnly detection
      let errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Found readOnly property at: user.id.');

      // Testing deep writeOnly detection
      errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'writeOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Found writeOnly property at: user.credentials.password.');
    });

    it('detects properties in array items', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  readOnly: true,
                },
                secret: {
                  type: 'string',
                  writeOnly: true,
                },
              },
            },
          },
        },
      };

      // Testing readOnly in array items
      let errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Found readOnly property at: items.items.id.');

      // Testing writeOnly in array items
      errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'writeOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Found writeOnly property at: items.items.secret.');
    });

    it('detects properties in schema combiners', () => {
      const schema = {
        allOf: [
          {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                readOnly: true,
              },
            },
          },
        ],
        anyOf: [
          {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                writeOnly: true,
              },
            },
          },
        ],
        oneOf: [
          {
            type: 'object',
          },
          {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                readOnly: true,
              },
            },
          },
        ],
      };

      // Testing readOnly in combiners
      let errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toContain('Found readOnly property at: allOf.0.id.');
      expect(errors[1].message).toContain('Found readOnly property at: oneOf.1.token.');

      // Testing writeOnly in combiners
      errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'writeOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Found writeOnly property at: anyOf.0.key.');
    });

    it('correctly accumulates multiple errors', () => {
      const schema = {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            readOnly: true,
          },
          nested: {
            type: 'object',
            properties: {
              innerId: {
                type: 'string',
                readOnly: true,
              },
            },
          },
          items: {
            type: 'array',
            items: {
              readOnly: true,
            },
          },
        },
      };

      const errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);

      expect(errors).toHaveLength(3);
      expect(errors[0].message).toContain('Found readOnly property at: id.');
      expect(errors[1].message).toContain('Found readOnly property at: nested.innerId.');
      expect(errors[2].message).toContain('Found readOnly property at: items.items.');
    });

    it('handles empty objects', () => {
      const schema = {};
      const errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(0);
    });

    it('handles schemas with no matching attributes', () => {
      const schema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          nested: {
            type: 'object',
            properties: {
              value: { type: 'number' },
            },
          },
          items: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      };

      const errors = checkForbiddenPropertyAttributesAndReturnErrors(schema, 'readOnly', mockPath, [], errorMessage);
      expect(errors).toHaveLength(0);
    });
  });
});
