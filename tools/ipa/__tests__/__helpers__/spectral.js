import { pattern, truthy } from '@stoplight/spectral-functions';
import eachResourceHasGetMethod from '/Users/lovisa.berggren/openapi/tools/ipa/rulesets/functions/eachResourceHasGetMethod.js';
export default {
  extends: [
    {
      rules: {
        'xgen-IPA-104-resource-has-GET': {
          description: 'APIs must provide a get method for resources. http://go/ipa/104',
          message: '{{error}} http://go/ipa/117',
          severity: 'warn',
          given: '$.paths',
          then: {
            field: '@key',
            function: eachResourceHasGetMethod,
          },
        },
      },
    },
    {
      aliases: {
        PathItem: ['$.paths[*]'],
        OperationObject: ['#PathItem[get,put,post,delete,options,head,patch,trace]'],
        DescribableObjects: [
          '$.info',
          '$.tags[*]',
          '#OperationObject',
          '#PathItem.parameters[?(@ && @.in)]',
          '#OperationObject.parameters[?(@ && @.in)]',
          '$.components.schemas[*].properties[?(@ && @.type)]',
        ],
      },
      rules: {
        'xgen-description': {
          description:
            'Use this field to describe the action performed by each specific API endpoint or property, to provide context for how to use it to the users of the API.',
          message: 'Property must have a description.',
          severity: 'error',
          given: '#DescribableObjects',
          then: [
            {
              field: 'description',
              function: truthy,
            },
            {
              field: 'description',
              function: pattern,
              functionOptions: {
                match: '/^[A-Z]/',
              },
            },
            {
              field: 'description',
              function: pattern,
              functionOptions: {
                match: '\\.|',
              },
            },
          ],
        },
      },
    },
  ],
};
