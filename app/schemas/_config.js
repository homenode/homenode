const validTypesEnum = require('./_types.js');

module.exports = {
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
