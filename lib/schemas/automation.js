module.exports = {
  type: 'object',
  required: ['id', 'trigger'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
    },
    startup: {
      type: 'string',
      const: 'function',
    },
    trigger: {
      type: 'string',
      const: 'function',
    },
  },
};
