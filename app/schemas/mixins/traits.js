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
      },
    },
  };

  obj.properties.handleTraitChange = {
    type: 'string',
    const: 'function',
  };

  obj.properties.afterTraitChange = {
    type: 'string',
    const: 'function',
  };
};
