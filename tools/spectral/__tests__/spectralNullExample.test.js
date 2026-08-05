import { Spectral } from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';

describe('Spectral OAS ruleset compatibility', () => {
  it('does not crash when a request-body example contains a null value', async () => {
    const spectral = new Spectral();
    spectral.setRuleset(oas);

    const document = {
      openapi: '3.0.3',
      info: {
        title: 'Null example regression',
        version: '1.0.0',
      },
      paths: {
        '/dashboards/import': {
          post: {
            responses: {
              200: {
                description: 'OK',
              },
            },
            requestBody: {
              content: {
                'application/json': {
                  example: {
                    items: {
                      'item-1': {
                        query: null,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    await expect(spectral.run(JSON.stringify(document))).resolves.toEqual(expect.any(Array));
  });
});
