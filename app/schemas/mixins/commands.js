module.exports = (obj) => {
  obj.properties.commands = {
    type: 'object',
    additionalProperties: {
      type: 'object',
      required: ['handler'],
      additionalProperties: false,
      properties: {
        handler: {
          type: 'string',
          const: 'function',
        },
      },
    },
  };
};
