const validTypesEnum = require('../_types.js');

module.exports = (obj) => {
  obj.properties.traits = {
    type: 'object',
    additionalProperties: {
      type: 'object',
      required: ['type'],
      additionalProperties: false,
      properties: {
        type: {
          type: 'string',
          enum: validTypesEnum,
        },
        history: {
          type: 'boolean',
        },
        default: {},
        handleChange: {
          type: 'string',
          const: 'function',
        },
        afterChange: {
          type: 'string',
          const: 'function',
        },
      },
    },
  };
};
