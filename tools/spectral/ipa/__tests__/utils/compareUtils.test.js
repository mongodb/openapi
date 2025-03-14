import { describe, expect, it } from '@jest/globals';
import {
  isDeepEqual,
  omitDeep,
  removePropertyByFlag,
  removeReadOnlyProperties,
  removeWriteOnlyProperties,
} from '../../rulesets/functions/utils/compareUtils';

describe('isDeepEqual', () => {
  it('handles primitive values', () => {
    expect(isDeepEqual(1, 1)).toBe(true);
    expect(isDeepEqual('hello', 'hello')).toBe(true);
    expect(isDeepEqual(true, true)).toBe(true);
    expect(isDeepEqual(null, null)).toBe(true);
    expect(isDeepEqual(undefined, undefined)).toBe(true);

    expect(isDeepEqual(1, 2)).toBe(false);
    expect(isDeepEqual('hello', 'world')).toBe(false);
    expect(isDeepEqual(true, false)).toBe(false);
    expect(isDeepEqual(null, undefined)).toBe(false);
    expect(isDeepEqual(1, '1')).toBe(false);
  });

  it('handles simple objects', () => {
    expect(isDeepEqual({}, {})).toBe(true);
    expect(isDeepEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isDeepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);

    expect(isDeepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isDeepEqual({ a: 1 }, { b: 1 })).toBe(false);
    expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('handles arrays', () => {
    expect(isDeepEqual([], [])).toBe(true);
    expect(isDeepEqual([1, 2], [1, 2])).toBe(true);

    expect(isDeepEqual([1, 2], [2, 1])).toBe(false);
    expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('handles nested objects', () => {
    expect(isDeepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);

    expect(isDeepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false);

    expect(isDeepEqual({ a: 1, b: { c: 2, d: 3 } }, { a: 1, b: { c: 2 } })).toBe(false);
  });

  it('handles nested arrays', () => {
    expect(isDeepEqual({ a: [1, 2, { b: 3 }] }, { a: [1, 2, { b: 3 }] })).toBe(true);

    expect(isDeepEqual({ a: [1, 2, { b: 3 }] }, { a: [1, 2, { b: 4 }] })).toBe(false);
  });

  it('handles mixed types', () => {
    expect(isDeepEqual({ a: 1 }, [1])).toBe(false);
    expect(isDeepEqual({ a: 1 }, null)).toBe(false);
    expect(isDeepEqual(null, { a: 1 })).toBe(false);
  });
});

describe('removePropertyByFlag', () => {
  it('handles primitive values', () => {
    expect(removePropertyByFlag(1, 'readOnly')).toBe(1);
    expect(removePropertyByFlag('hello', 'readOnly')).toBe('hello');
    expect(removePropertyByFlag(true, 'readOnly')).toBe(true);
    expect(removePropertyByFlag(null, 'readOnly')).toBe(null);
    expect(removePropertyByFlag(undefined, 'readOnly')).toBe(undefined);
  });

  it('handles empty objects', () => {
    expect(removePropertyByFlag({}, 'readOnly')).toEqual({});
  });

  it('removes properties with flagged attributes', () => {
    const input = {
      type: 'object',
      properties: {
        id: { type: 'string', readOnly: true },
        name: { type: 'string' },
        password: { type: 'string', test: true },
      },
    };

    const expectedReadOnly = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        password: { type: 'string', test: true },
      },
    };

    const expectedTest = {
      type: 'object',
      properties: {
        id: { type: 'string', readOnly: true },
        name: { type: 'string' },
      },
    };

    expect(removePropertyByFlag(input, 'readOnly')).toEqual(expectedReadOnly);
    expect(removePropertyByFlag(input, 'test')).toEqual(expectedTest);
  });

  it('processes nested objects', () => {
    const input = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', readOnly: true },
            name: { type: 'string' },
            metadata: {
              type: 'object',
              properties: {
                createdAt: { type: 'string', readOnly: true },
                updatedAt: { type: 'string', readOnly: true },
                notes: { type: 'string' },
              },
            },
          },
        },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            metadata: {
              type: 'object',
              properties: {
                notes: { type: 'string' },
              },
            },
          },
        },
      },
    };

    expect(removePropertyByFlag(input, 'readOnly')).toEqual(expected);
  });

  it('processes arrays', () => {
    const input = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', readOnly: true },
          name: { type: 'string' },
        },
      },
    };

    const expected = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    };

    expect(removePropertyByFlag(input, 'readOnly')).toEqual(expected);
  });

  it('handles array of objects', () => {
    const input = [
      { id: 1, readOnly: true },
      { id: 2, name: 'test' },
      {
        id: 3,
        properties: {
          secret: { type: 'string', readOnly: true },
          visible: { type: 'string' },
        },
      },
    ];

    const expected = [
      { id: 1 },
      { id: 2, name: 'test' },
      {
        id: 3,
        properties: {
          visible: { type: 'string' },
        },
      },
    ];

    expect(removePropertyByFlag(input, 'readOnly')).toEqual(expected);
  });
});

describe('removeReadOnlyProperties', () => {
  it('removes readOnly properties from schema', () => {
    const input = {
      type: 'object',
      properties: {
        id: { type: 'string', readOnly: true },
        name: { type: 'string' },
        details: {
          type: 'object',
          properties: {
            createdAt: { type: 'string', readOnly: true },
            description: { type: 'string' },
          },
        },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        details: {
          type: 'object',
          properties: {
            description: { type: 'string' },
          },
        },
      },
    };

    expect(removeReadOnlyProperties(input)).toEqual(expected);
  });
});

describe('removeWriteOnlyProperties', () => {
  it('removes writeOnly properties from schema', () => {
    const input = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        password: { type: 'string', writeOnly: true },
        details: {
          type: 'object',
          properties: {
            secretKey: { type: 'string', writeOnly: true },
            description: { type: 'string' },
          },
        },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        details: {
          type: 'object',
          properties: {
            description: { type: 'string' },
          },
        },
      },
    };

    expect(removeWriteOnlyProperties(input)).toEqual(expected);
  });
});

describe('schema compatibility use cases', () => {
  it('request and response schema comparison', () => {
    const requestSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string', writeOnly: true },
      },
      required: ['name', 'email', 'password'],
    };

    const responseSchema = {
      type: 'object',
      properties: {
        id: { type: 'string', readOnly: true },
        name: { type: 'string' },
        email: { type: 'string' },
        createdAt: { type: 'string', readOnly: true },
      },
      required: ['id', 'name', 'email', 'createdAt'],
    };

    const filteredRequest = removeWriteOnlyProperties(requestSchema);
    const filteredResponse = removeReadOnlyProperties(responseSchema);

    // Verify filtered schemas
    expect(filteredRequest).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['name', 'email', 'password'],
    });

    expect(filteredResponse).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
      required: ['id', 'name', 'email', 'createdAt'],
    });
  });
});
