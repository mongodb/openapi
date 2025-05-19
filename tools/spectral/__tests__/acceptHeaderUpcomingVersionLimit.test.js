import { DiagnosticSeverity } from '@stoplight/types';
import acceptHeaderUpcomingVersionLimit from '../functions/acceptHeaderUpcomingVersionLimit';

describe('accept-header-upcoming-version-limit', () => {
  it('valid: no upcoming Accept headers', () => {
    const operation = {
      operationId: 'getTest',
      responses: {
        200: {
          content: {
            'application/json': {},
          },
        },
      },
      requestBody: {
        content: {
          'application/json': {},
        },
      },
    };

    const result = acceptHeaderUpcomingVersionLimit(operation);
    expect(result).toBeUndefined();
  });

  it('valid: one upcoming Accept header in response', () => {
    const operation = {
      operationId: 'getTest',
      responses: {
        200: {
          content: {
            'application/vnd.atlas.2024-06-01.upcoming+json': {},
            'application/json': {},
          },
        },
      },
    };

    const result = acceptHeaderUpcomingVersionLimit(operation);
    expect(result).toBeUndefined();
  });

  it('invalid: two upcoming Accept headers in response', () => {
    const operation = {
      operationId: 'getTest',
      responses: {
        200: {
          content: {
            'application/vnd.atlas.2024-06-01.upcoming+json': {},
            'application/vnd.atlas.2024-07-01.upcoming+json': {},
            'application/json': {},
          },
        },
      },
    };

    const result = acceptHeaderUpcomingVersionLimit(operation);
    expect(result).toEqual([
      {
        message: expect.stringMatching(/Found 2 upcoming API Accept headers/),
      },
    ]);
  });

  it('invalid: two upcoming Accept headers in request', () => {
    const operation = {
      operationId: 'postTest',
      requestBody: {
        content: {
          'application/vnd.atlas.2024-06-01.upcoming+json': {},
          'application/vnd.atlas.2024-07-01.upcoming+json': {},
          'application/json': {},
        },
      },
    };

    const result = acceptHeaderUpcomingVersionLimit(operation);
    expect(result).toEqual([
      {
        message: expect.stringMatching(/Found 2 upcoming API Accept headers/),
      },
    ]);
  });

  it('invalid: missing operationId', () => {
    const operation = {
      responses: {
        200: {
          content: {
            'application/vnd.atlas.2024-06-01.upcoming+json': {},
          },
        },
      },
    };

    const result = acceptHeaderUpcomingVersionLimit(operation);
    expect(result).toBeUndefined();
  });
}); 