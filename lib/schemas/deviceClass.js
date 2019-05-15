const validTypesEnum = require('./_types.js');
const configSchema = require('./_config.js');

module.exports = {
  type: 'object',
  required: ['type', 'plugin'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
    },
    plugin: {
      type: 'string',
    },
    interface: {
      type: 'string',
    },
    startup: {
      type: 'string',
      const: 'function',
    },
    config: configSchema,
    polling: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['secs', 'handler'],
        additionalProperties: false,
        properties: {
          runAtStartup: {
            type: 'boolean',
          },
          secs: {
            type: 'integer',
          },
          silent: {
            type: 'boolean',
          },
          handler: {
            type: 'string',
            const: 'function',
          },
        },
      },
    },
    traits: {
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
    },
    handleTraitChange: {
      type: 'string',
      const: 'function',
    },
    afterTraitChange: {
      type: 'string',
      const: 'function',
    },
  },
};
