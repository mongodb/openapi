import { describe, expect, it } from '@jest/globals';
import {
  isDeepEqual,
  removePropertiesByFlag,
  removePropertyKeys,
  removeRequestProperties,
  removeResponseProperties,
} from '../../rulesets/functions/utils/compareUtils.js';

describe('isDeepEqual', () => {
  it('should return true for identical primitive values', () => {
    expect(isDeepEqual('string', 'string')).toBe(true);
    expect(isDeepEqual(42, 42)).toBe(true);
    expect(isDeepEqual(true, true)).toBe(true);
    expect(isDeepEqual(null, null)).toBe(true);
  });

  it('should return true for same type primitives', () => {
    expect(isDeepEqual('string1', 'string2')).toBe(true);
    expect(isDeepEqual(42, 100)).toBe(true);
  });

  it('should return false for different type primitives', () => {
    expect(isDeepEqual('string', 42)).toBe(false);
    expect(isDeepEqual(42, true)).toBe(false);
    expect(isDeepEqual(null, 'string')).toBe(false);
  });

  it('should handle null/undefined correctly', () => {
    expect(isDeepEqual(null, null)).toBe(true);
    expect(isDeepEqual(undefined, undefined)).toBe(true);
  });

  it('should compare object types correctly', () => {
    expect(isDeepEqual({ type: 'string' }, { type: 'string' })).toBe(true);
    expect(isDeepEqual({ type: 'string' }, { type: 'number' })).toBe(false);
  });

  it('should ignore validation constraints', () => {
    expect(isDeepEqual({ type: 'string', minLength: 5 }, { type: 'string', maxLength: 10 })).toBe(true);

    expect(isDeepEqual({ type: 'array', minItems: 1 }, { type: 'array' })).toBe(true);
  });

  it('should compare schema properties structure', () => {
    const schema1 = {
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      type: 'object',
    };

    const schema2 = {
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      type: 'object',
    };

    expect(isDeepEqual(schema1, schema2)).toBe(true);
  });

  it('should detect different properties structure', () => {
    const schema1 = {
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      type: 'object',
    };

    const schema2 = {
      properties: {
        name: { type: 'string' },
        height: { type: 'number' },
      },
      type: 'object',
    };

    expect(isDeepEqual(schema1, schema2)).toBe(false);
  });

  it('should compare nested schema structures', () => {
    const schema1 = {
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            details: {
              type: 'object',
              properties: {
                age: { type: 'number' },
              },
            },
          },
        },
      },
      type: 'object',
    };

    const schema2 = {
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            details: {
              type: 'object',
              properties: {
                age: { type: 'number' },
              },
            },
          },
        },
      },
      type: 'object',
    };

    expect(isDeepEqual(schema1, schema2)).toBe(true);
  });

  it('should handle example from the prompt', () => {
    const schema1 = {
      properties: {
        desc: { maxLength: 250, minLength: 1, type: 'string' },
        roles: { items: {}, minItems: 1, type: 'array' },
      },
      type: 'object',
    };

    const schema2 = {
      properties: {
        desc: { maxLength: 250, minLength: 1, type: 'string' },
        roles: { items: {}, type: 'array' },
      },
      type: 'object',
    };

    expect(isDeepEqual(schema1, schema2)).toBe(true);
  });
});

describe('removePropertiesByFlag', () => {
  it('should return primitives unchanged', () => {
    expect(removePropertiesByFlag('string', 'readOnly')).toBe('string');
    expect(removePropertiesByFlag(42, 'readOnly')).toBe(42);
    expect(removePropertiesByFlag(null, 'readOnly')).toBe(null);
  });

  it('should remove flagged properties from schema properties', () => {
    const input = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        id: { type: 'string', readOnly: true },
        email: { type: 'string' },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
    };

    expect(removePropertiesByFlag(input, 'readOnly')).toEqual(expected);
  });

  it('should handle nested objects recursively', () => {
    const input = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            id: { type: 'string', readOnly: true },
            details: {
              type: 'object',
              properties: {
                age: { type: 'number' },
                createdAt: { type: 'string', readOnly: true },
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
            details: {
              type: 'object',
              properties: {
                age: { type: 'number' },
              },
            },
          },
        },
      },
    };

    expect(removePropertiesByFlag(input, 'readOnly')).toEqual(expected);
  });
});

describe('removePropertyKeys', () => {
  it('should return primitives unchanged', () => {
    expect(removePropertyKeys('string', 'title')).toBe('string');
    expect(removePropertyKeys(42, 'title')).toBe(42);
    expect(removePropertyKeys(null, 'title')).toBe(null);
  });

  it('should remove specified top-level properties', () => {
    const input = {
      title: 'User',
      description: 'User schema',
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    expect(removePropertyKeys(input, 'title', 'description')).toEqual(expected);
  });

  it('should remove properties recursively', () => {
    const input = {
      title: 'User',
      type: 'object',
      properties: {
        user: {
          title: 'User details',
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'User name',
              description: 'Full name of the user',
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
            name: {
              type: 'string',
            },
          },
        },
      },
    };

    expect(removePropertyKeys(input, 'title', 'description')).toEqual(expected);
  });
});

describe('removeResponseProperties', () => {
  it('should remove readOnly properties and metadata', () => {
    const input = {
      title: 'User Response',
      description: 'User data returned by the API',
      required: ['name'],
      type: 'object',
      properties: {
        name: { type: 'string' },
        id: { type: 'string', readOnly: true },
        email: { type: 'string' },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
    };

    expect(removeResponseProperties(input)).toEqual(expected);
  });
});

describe('removeRequestProperties', () => {
  it('should remove writeOnly properties and metadata', () => {
    const input = {
      title: 'User Request',
      description: 'User data sent to the API',
      required: ['name', 'password'],
      type: 'object',
      properties: {
        name: { type: 'string' },
        password: { type: 'string', writeOnly: true },
        email: { type: 'string' },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
    };

    expect(removeRequestProperties(input)).toEqual(expected);
  });
});
