const readOnlyObject = {
  type: 'object',
  properties: { id: { type: 'string', readOnly: true } },
};

export const readOnlySchemaCases = [
  {
    description: 'an empty schema without a read-only annotation',
    schema: {},
    expected: false,
  },
  {
    description: 'an open empty object',
    schema: { type: 'object', properties: {} },
    expected: false,
  },
  ...[undefined, {}].map((properties) => ({
    description: `a closed empty object with ${properties ? 'empty' : 'omitted'} properties`,
    schema: { type: 'object', ...(properties ? { properties } : {}), additionalProperties: false },
    expected: true,
  })),
  {
    description: 'an explicitly read-only empty object',
    schema: { type: 'object', readOnly: true },
    expected: true,
  },
  ...[true, {}, { type: 'string' }].flatMap((additionalProperties) => [
    {
      description: `read-only named fields with writable additionalProperties ${JSON.stringify(additionalProperties)}`,
      schema: { ...readOnlyObject, additionalProperties },
      expected: false,
    },
    {
      description: `an explicitly read-only object with additionalProperties ${JSON.stringify(additionalProperties)}`,
      schema: { ...readOnlyObject, readOnly: true, additionalProperties },
      expected: true,
    },
  ]),
  {
    description: 'an explicitly read-only object with writable named and additional fields',
    schema: {
      type: 'object',
      readOnly: true,
      properties: { name: { type: 'string' } },
      additionalProperties: { type: 'string' },
    },
    expected: true,
  },
  {
    description: 'a nested object with read-only named fields and writable dictionary entries',
    schema: {
      type: 'object',
      properties: {
        metadata: { ...readOnlyObject, additionalProperties: { type: 'string' } },
      },
    },
    expected: false,
  },
  {
    description: 'a dictionary of explicitly read-only values',
    schema: { type: 'object', additionalProperties: { type: 'string', readOnly: true } },
    expected: true,
  },
  {
    description: 'a dictionary of objects containing only read-only fields',
    schema: { type: 'object', additionalProperties: readOnlyObject },
    expected: true,
  },
  {
    description: 'a dictionary of objects containing writable fields',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: { id: { type: 'string', readOnly: true }, name: { type: 'string' } },
      },
    },
    expected: false,
  },
  {
    description: 'a dictionary of open empty objects',
    schema: { type: 'object', additionalProperties: { type: 'object' } },
    expected: false,
  },
  {
    description: 'read-only named fields alongside read-only dictionary entries',
    schema: { ...readOnlyObject, additionalProperties: readOnlyObject },
    expected: true,
  },
  {
    description: 'writable named fields alongside read-only dictionary entries',
    schema: {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: readOnlyObject,
    },
    expected: false,
  },
  {
    description: 'an array without an items schema',
    schema: { type: 'array' },
    expected: false,
  },
  {
    description: 'an array with only object-specific constraints',
    schema: { type: 'array', properties: readOnlyObject.properties, additionalProperties: false },
    expected: false,
  },
  {
    description: 'an object with only an array-specific constraint',
    schema: { type: 'object', items: readOnlyObject },
    expected: false,
  },
  {
    description: 'an enum without field definitions',
    schema: { enum: ['ONE', 'TWO'] },
    expected: false,
  },
  ...['allOf', 'anyOf', 'oneOf'].flatMap((composition) => [
    {
      description: `read-only fields with a required-only ${composition} branch`,
      schema: { ...readOnlyObject, [composition]: [{ required: ['id'] }] },
      expected: true,
    },
    {
      description: `read-only fields with an object-type-only ${composition} branch`,
      schema: { ...readOnlyObject, [composition]: [{ type: 'object' }] },
      expected: true,
    },
    {
      description: `read-only array items with an array-type-only ${composition} branch`,
      schema: { type: 'array', items: readOnlyObject, [composition]: [{ type: 'array' }] },
      expected: true,
    },
    {
      description: `writable fields with a required-only ${composition} branch`,
      schema: { type: 'object', properties: { id: { type: 'string' } }, [composition]: [{ required: ['id'] }] },
      expected: false,
    },
    {
      description: `a ${composition} containing only constraints`,
      schema: { [composition]: [{ type: 'object', required: ['id'] }] },
      expected: false,
    },
    {
      description: `a ${composition} containing read-only fields and a constraint-only branch`,
      schema: { [composition]: [readOnlyObject, { required: ['id'] }] },
      expected: composition === 'allOf',
    },
    {
      description: `a ${composition} containing read-only fields and an unconstrained branch`,
      schema: { [composition]: [readOnlyObject, {}] },
      expected: composition === 'allOf',
    },
    {
      description: `a ${composition} containing array items and an array-type-only branch`,
      schema: { [composition]: [{ items: readOnlyObject }, { type: 'array' }] },
      expected: composition === 'allOf',
    },
    {
      description: `a ${composition} containing read-only fields and a writable primitive`,
      schema: { [composition]: [readOnlyObject, { type: 'string' }] },
      expected: false,
    },
    {
      description: `empty properties alongside read-only ${composition} branches`,
      schema: { properties: {}, [composition]: [readOnlyObject] },
      expected: true,
    },
  ]),
];

export const listResponseSchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      readOnly: true,
      items: { type: 'object', properties: { name: { type: 'string' } } },
    },
    totalCount: { type: 'integer', readOnly: true },
  },
};

export const listResponseCases = [
  { description: 'an inline list response', schema: listResponseSchema, expected: false },
  ...['allOf', 'anyOf', 'oneOf'].map((composition) => ({
    description: `a list response wrapped in ${composition}`,
    schema: { [composition]: [listResponseSchema] },
    expected: false,
  })),
  {
    description: 'list fields split across allOf branches',
    schema: {
      allOf: [
        { type: 'object', properties: { results: listResponseSchema.properties.results } },
        { type: 'object', properties: { totalCount: listResponseSchema.properties.totalCount } },
      ],
    },
    expected: false,
  },
  {
    description: 'list results and a required constraint split across allOf branches',
    schema: {
      allOf: [
        { type: 'object', properties: { results: listResponseSchema.properties.results } },
        { required: ['results'] },
      ],
    },
    expected: false,
  },
  ...['anyOf', 'oneOf'].flatMap((composition) => [
    {
      description: `list metadata shared with a ${composition} results branch`,
      schema: {
        properties: { totalCount: listResponseSchema.properties.totalCount },
        [composition]: [{ properties: { results: listResponseSchema.properties.results } }, readOnlyObject],
      },
      expected: false,
    },
    {
      description: `non-list fields in separate ${composition} alternatives`,
      schema: {
        [composition]: [
          { properties: { results: listResponseSchema.properties.results } },
          { properties: { totalCount: listResponseSchema.properties.totalCount } },
        ],
      },
      expected: true,
    },
  ]),
  {
    description: 'a resource containing a nested list rather than being a list itself',
    schema: { type: 'object', properties: { history: listResponseSchema } },
    expected: true,
  },
];

export function documentForResponseSchema(schema, resourcePath, methods = {}) {
  return {
    paths: {
      [resourcePath]: {
        ...methods,
        get: {
          responses: {
            200: {
              description: 'OK',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Response' } } },
            },
          },
        },
      },
    },
    components: { schemas: { Response: schema, ListResponse: listResponseSchema } },
  };
}
