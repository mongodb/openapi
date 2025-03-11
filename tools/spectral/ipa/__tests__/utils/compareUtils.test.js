import { describe, expect, it } from '@jest/globals';
import { isDeepEqual, omitDeep } from '../../rulesets/functions/utils/compareUtils';

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

describe('omitDeep', () => {
  it('handles primitives', () => {
    expect(omitDeep(1, 'any')).toBe(1);
    expect(omitDeep('hello', 'any')).toBe('hello');
    expect(omitDeep(null, 'any')).toBe(null);
    expect(omitDeep(undefined, 'any')).toBe(undefined);
  });

  it('handles shallow objects', () => {
    expect(omitDeep({ a: 1, b: 2 }, 'a')).toEqual({ b: 2 });
    expect(omitDeep({ a: 1, b: 2 }, 'c')).toEqual({ a: 1, b: 2 });
    expect(omitDeep({ a: 1, b: 2 }, 'a', 'b')).toEqual({});
  });

  it('handles arrays', () => {
    expect(
      omitDeep(
        [
          { a: 1, b: 2 },
          { a: 3, b: 4 },
        ],
        'a'
      )
    ).toEqual([{ b: 2 }, { b: 4 }]);
  });

  it('handles nested objects', () => {
    const input = {
      a: 1,
      b: {
        c: 2,
        d: 3,
        e: {
          f: 4,
          g: 5,
        },
      },
      h: 6,
    };

    const expected = {
      a: 1,
      b: {
        d: 3,
        e: {
          g: 5,
        },
      },
      h: 6,
    };

    expect(omitDeep(input, 'c', 'f')).toEqual(expected);
  });

  it('handles deeply nested arrays', () => {
    const input = {
      items: [
        { id: 1, name: 'item1', metadata: { created: '2023', readOnly: true } },
        { id: 2, name: 'item2', metadata: { created: '2023', readOnly: true } },
      ],
    };

    const expected = {
      items: [
        { id: 1, name: 'item1', metadata: { created: '2023' } },
        { id: 2, name: 'item2', metadata: { created: '2023' } },
      ],
    };

    expect(omitDeep(input, 'readOnly')).toEqual(expected);
  });

  it('handles complex schemas', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        id: { type: 'string', readOnly: true },
        details: {
          type: 'object',
          properties: {
            createdAt: { type: 'string', readOnly: true },
            description: { type: 'string' },
          },
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemId: { type: 'string', readOnly: true },
              itemName: { type: 'string' },
            },
          },
        },
      },
    };

    const expected = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        id: { type: 'string' },
        details: {
          type: 'object',
          properties: {
            createdAt: { type: 'string' },
            description: { type: 'string' },
          },
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemId: { type: 'string' },
              itemName: { type: 'string' },
            },
          },
        },
      },
    };

    expect(omitDeep(schema, 'readOnly')).toEqual(expected);
  });

  it('handles multiple keys to omit', () => {
    const input = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4,
        f: {
          g: 5,
          h: 6,
        },
      },
    };

    expect(omitDeep(input, 'a', 'e', 'g')).toEqual({
      b: 2,
      c: {
        d: 3,
        f: {
          h: 6,
        },
      },
    });
  });
});
