import { describe, expect, it } from '@jest/globals';
import {
  validateOperationIdAndReturnErrors,
  validateOperationIdLengthAndReturnErrors,
} from '../../../rulesets/functions/utils/validations/validateOperationIdAndReturnErrors.js';

describe('tools/spectral/ipa/rulesets/functions/utils/validations/validateOperationIdAndReturnErrors.js', () => {
  it('should return no errors for valid operation ID', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/resource',
        {
          operationId: 'getResource',
        },
        ['paths', '/resource', 'get']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}',
        {
          operationId: 'getSomeResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}', 'get']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'update',
        '/some/{id}/resource/{resourceId}',
        {
          operationId: 'updateSomeResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}', 'patch']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'delete',
        '/some/{id}/resource/{resourceId}',
        {
          operationId: 'deleteSomeResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}', 'delete']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'list',
        '/some/{id}/resource',
        {
          operationId: 'listSomeResource',
        },
        ['paths', '/some/{id}/resource', 'get']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'create',
        '/some/{id}/resource',
        {
          operationId: 'createSomeResource',
        },
        ['paths', '/some/{id}/resource', 'post']
      )
    ).toHaveLength(0);

    // Custom methods
    expect(
      validateOperationIdAndReturnErrors(
        'getRoot',
        '/',
        {
          operationId: 'getRoot',
        },
        ['paths', '/', 'get']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'toggle',
        '/some/{id}/setting',
        {
          operationId: 'toggleSomeSetting',
        },
        ['paths', '/some/{id}/setting:toggle', 'post']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'toggle',
        '/some/{id}/feature/{featureName}',
        {
          operationId: 'toggleSomeFeature',
        },
        ['paths', '/some/{id}/feature/{featureName}:toggle', 'post']
      )
    ).toHaveLength(0);

    // Legacy custom methods
    expect(
      validateOperationIdAndReturnErrors(
        '',
        '/some/{id}/feature/{featureName}/toggle',
        {
          operationId: 'toggleSomeFeature',
        },
        ['paths', '/some/{id}/feature/{featureName}/toggle', 'post']
      )
    ).toHaveLength(0);
  });

  it('should return no errors for valid operation ID override', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}',
        {
          operationId: 'getSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'getChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}', 'get']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'update',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}',
        {
          operationId: 'updateSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'updateChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}', 'patch']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'delete',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}',
        {
          operationId: 'deleteSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'deleteChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}', 'delete']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'list',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        {
          operationId: 'listSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'listChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'get']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'create',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        {
          operationId: 'createSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'createChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'post']
      )
    ).toHaveLength(0);

    // Custom methods
    expect(
      validateOperationIdAndReturnErrors(
        'toggle',
        '/some/{id}/resource/{resourceId}/long/{id}/setting',
        {
          operationId: 'toggleSomeResourceLongSetting',
          'x-xgen-operation-id-override': 'toggleSomeSetting',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/setting:toggle', 'post']
      )
    ).toHaveLength(0);
    expect(
      validateOperationIdAndReturnErrors(
        'toggle',
        '/some/{id}/resource/{resourceId}/long/{id}/feature/{featureName}',
        {
          operationId: 'toggleSomeResourceLongFeature',
          'x-xgen-operation-id-override': 'toggleSomeFeature',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/feature/{featureName}:toggle', 'post']
      )
    ).toHaveLength(0);

    // Nouns in word swapped order
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}',
        {
          operationId: 'getSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'getChildLongResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource/{id}', 'get']
      )
    ).toHaveLength(0);

    // valid override on short opID
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}',
        {
          operationId: 'getSomeResource',
          'x-xgen-operation-id-override': 'getResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}', 'get']
      )
    ).toHaveLength(0);
  });

  it('should return errors for invalid operation ID', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}',
        {
          operationId: 'invalidOperationId',
        },
        ['paths', '/some/{id}/resource/{resourceId}', 'get']
      )
    ).toEqual([
      {
        path: ['paths', '/some/{id}/resource/{resourceId}', 'get', 'operationId'],
        message: "Invalid OperationID. Found 'invalidOperationId', expected 'getSomeResource'.",
      },
    ]);

    // Custom method
    expect(
      validateOperationIdAndReturnErrors(
        'toggle',
        '/some/{id}/resource/{resourceId}',
        {
          operationId: 'createSomeResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}:toggle', 'post']
      )
    ).toEqual([
      {
        path: ['paths', '/some/{id}/resource/{resourceId}:toggle', 'post', 'operationId'],
        message: "Invalid OperationID. Found 'createSomeResource', expected 'toggleSomeResource'.",
      },
    ]);
  });

  it('should return no errors for long operation ID without override', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'create',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        {
          operationId: 'createSomeResourceLongChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'post']
      )
    ).toHaveLength(0);
  });

  it('should return errors for operation ID override with wrong verb', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        {
          operationId: 'getSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'listResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'get']
      )
    ).toEqual([
      {
        path: [
          'paths',
          '/some/{id}/resource/{resourceId}/long/{id}/childResource',
          'get',
          'x-xgen-operation-id-override',
        ],
        message: "The operation ID override must start with the verb 'get'.",
      },
    ]);
  });

  it('should return errors for too long operation ID override', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        {
          operationId: 'getSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'getSomeResourceChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'get']
      )
    ).toEqual([
      {
        path: [
          'paths',
          '/some/{id}/resource/{resourceId}/long/{id}/childResource',
          'get',
          'x-xgen-operation-id-override',
        ],
        message: 'The operation ID override is longer than 4 words. Please shorten it.',
      },
    ]);
  });

  it('should return errors for operation ID override with invalid nouns', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        {
          operationId: 'getSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'getSomeSpecialResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'get']
      )
    ).toEqual([
      {
        path: [
          'paths',
          '/some/{id}/resource/{resourceId}/long/{id}/childResource',
          'get',
          'x-xgen-operation-id-override',
        ],
        message:
          "The operation ID override must only contain nouns from the operation ID 'getSomeResourceLongChildResource'.",
      },
    ]);
  });

  it('should return errors for operation ID override with invalid last noun', () => {
    expect(
      validateOperationIdAndReturnErrors(
        'get',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        {
          operationId: 'getSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'getSomeChild',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'get']
      )
    ).toEqual([
      {
        path: [
          'paths',
          '/some/{id}/resource/{resourceId}/long/{id}/childResource',
          'get',
          'x-xgen-operation-id-override',
        ],
        message: "The operation ID override must end with the noun 'Resource'.",
      },
    ]);
  });

  it('should return all override errors for invalid operation ID override', () => {
    const errors = validateOperationIdAndReturnErrors(
      'get',
      '/some/{id}/resource/{resourceId}/long/{id}/childResource',
      {
        operationId: 'getSomeResourceLongChildResource',
        'x-xgen-operation-id-override': 'createSimpleCoffeeVanillaSyrup',
      },
      ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'get']
    );
    expect(errors).toHaveLength(4);
    errors.forEach((error) => {
      expect(error.path).toEqual([
        'paths',
        '/some/{id}/resource/{resourceId}/long/{id}/childResource',
        'get',
        'x-xgen-operation-id-override',
      ]);
    });
    expect(errors[0].message).toEqual("The operation ID override must start with the verb 'get'.");
    expect(errors[1].message).toEqual('The operation ID override is longer than 4 words. Please shorten it.');
    expect(errors[2].message).toEqual(
      "The operation ID override must only contain nouns from the operation ID 'getSomeResourceLongChildResource'."
    );
    expect(errors[3].message).toEqual("The operation ID override must end with the noun 'Resource'.");
  });
});

describe('validateOperationIdLengthAndReturnErrors', () => {
  it('should return no errors for operation ID with 4 words or less', () => {
    expect(
      validateOperationIdLengthAndReturnErrors(
        {
          operationId: 'getResource',
        },
        ['paths', '/resource', 'get'],
        'getResource'
      )
    ).toHaveLength(0);

    expect(
      validateOperationIdLengthAndReturnErrors(
        {
          operationId: 'getSomeResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}', 'get'],
        'getSomeResource'
      )
    ).toHaveLength(0);

    expect(
      validateOperationIdLengthAndReturnErrors(
        {
          operationId: 'createSomeResourceChild',
        },
        ['paths', '/some/{id}/resource/{resourceId}/child', 'post'],
        'createSomeResourceChild'
      )
    ).toHaveLength(0);
  });

  it('should return errors for operation ID longer than 4 words without override', () => {
    expect(
      validateOperationIdLengthAndReturnErrors(
        {
          operationId: 'createSomeResourceLongChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'post'],
        'createSomeResourceLongChildResource'
      )
    ).toEqual([
      {
        path: ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'post', 'operationId'],
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. For example: 'createLongChildResource'.",
      },
    ]);
  });

  it('should return no errors for operation ID longer than 4 words with override', () => {
    expect(
      validateOperationIdLengthAndReturnErrors(
        {
          operationId: 'createSomeResourceLongChildResource',
          'x-xgen-operation-id-override': 'createLongChildResource',
        },
        ['paths', '/some/{id}/resource/{resourceId}/long/{id}/childResource', 'post'],
        'createSomeResourceLongChildResource'
      )
    ).toHaveLength(0);
  });
});
