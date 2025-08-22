import testRule from './__helpers__/testRule.js';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-100-spellcheck', [
  {
    name: 'valid tags',
    document: {
      tags: [
        {
          name: 'Project',
          description: 'This is a project tag with correct spelling.',
        },
      ],
    },
    errors: [],
  },
  {
    name: 'valid operation summaries',
    document: {
      paths: {
        '/example': {
          get: {
            summary: 'This is a valid operation summary with correct spelling.',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid descriptions',
    document: {
      paths: {
        '/example': {
          get: {
            parameters: [
              {
                name: 'exampleParam',
                description: 'This is a valid description with correct spelling.',
              },
            ],
            description: 'This is a valid description with correct spelling.',
            externalDocs: {
              description: 'This is a valid description with correct spelling.',
              url: 'https://www.mongodb.com/docs/atlas/security-self-managed-x509/',
            },
          },
        },
      },
      components: {
        parameters: {
          name: 'exampleParam',
          description: 'This is a valid description with correct spelling.',
        },
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              exampleField: {
                type: 'string',
                description: 'This is a valid schema description with correct spelling.',
              },
              nestedSchema: {
                type: 'object',
                properties: {
                  exampleField: {
                    type: 'string',
                    description: 'This is a valid schema description with correct spelling.',
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid tags',
    document: {
      tags: [
        {
          name: 'Projct',
          description: 'This is a project tag with incorrect speling.',
        },
      ],
    },
    errors: [
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['tags', '0', 'name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['tags', '0', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid operation summaries',
    document: {
      paths: {
        '/example': {
          get: {
            summary: 'This is a operation summary with incorrect speling.',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['paths', '/example', 'get', 'summary'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid descriptions',
    document: {
      paths: {
        '/example': {
          get: {
            parameters: [
              {
                name: 'exampleParam',
                description: 'This is a description with incorrect speling.',
              },
            ],
            description: 'This is a description with incorrect speling.',
            externalDocs: {
              description: 'This is a description with incorrect speling.',
              url: 'https://www.mongodb.com/docs/atlas/security-self-managed-x509/',
            },
          },
        },
      },
      components: {
        parameters: {
          exampleParam: {
            description: 'This is a description with incorrect speling.',
          },
        },
        schemas: {
          ExampleSchema: {
            description: 'This is a schema description with incorrect speling.',
            type: 'object',
            properties: {
              exampleField: {
                type: 'string',
                description: 'This is a schema description with incorrect speling.',
              },
              nestedSchema: {
                type: 'object',
                description: 'This is a schema description with incorrect speling.',
                properties: {
                  exampleField: {
                    type: 'string',
                    description: 'This is a schema description with incorrect speling.',
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['paths', '/example', 'get', 'parameters', '0', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['paths', '/example', 'get', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['paths', '/example', 'get', 'externalDocs', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['components', 'parameters', 'exampleParam', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['components', 'schemas', 'ExampleSchema', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['components', 'schemas', 'ExampleSchema', 'properties', 'exampleField', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['components', 'schemas', 'ExampleSchema', 'properties', 'nestedSchema', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: [
          'components',
          'schemas',
          'ExampleSchema',
          'properties',
          'nestedSchema',
          'properties',
          'exampleField',
          'description',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'ignores custom words',
    document: {
      tags: [
        {
          name: 'MongoDB',
          description: 'This is a MongoDB tag with correct spelling.',
        },
      ],
    },
    errors: [],
  },
  {
    name: 'handles markdown',
    document: {
      tags: [
        {
          name: 'Project',
          description: '**This** is a project tag with correct spelling.',
        },
        {
          name: 'Organization',
          description: 'This is an _organization_ tag with correct spelling.',
        },
        {
          name: 'MongoDB',
          description: 'This is a tag with correct [spelling](https://www.oed.com/).',
        },
      ],
    },
    errors: [],
  },
  {
    name: 'uses American English',
    document: {
      tags: [
        {
          name: 'Project',
          description: 'This is a specialized project tag with correct spelling.',
        },
        {
          name: 'Organization',
          description: 'This is a specialised organization tag with correct spelling.',
        },
      ],
    },
    errors: [
      {
        code: 'xgen-IPA-100-spellcheck',
        message: '',
        path: ['tags', '1', 'description'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
