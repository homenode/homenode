module.exports = (obj) => {
  obj.properties.polling = {
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
  };
};
