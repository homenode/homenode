const validTypesEnum = require('../_types.js');

module.exports = (obj) => {
  obj.properties.config = {
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
        required: {
          type: 'boolean',
        },
        default: {},
      },
    },
  };
};
