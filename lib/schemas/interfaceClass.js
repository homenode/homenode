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
    startup: {
      type: 'string',
      const: 'function',
    },
    config: configSchema,
  },
};
