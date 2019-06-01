const configMixin = require('./mixins/config.js');
const pollingMixin = require('./mixins/polling.js');
const traitsMixin = require('./mixins/traits.js');
const eventsMixin = require('./mixins/events.js');
const commandsMixin = require('./mixins/commands.js');

const schema = {
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
  },
};

configMixin(schema);
pollingMixin(schema);
traitsMixin(schema);
eventsMixin(schema);
commandsMixin(schema);

module.exports = schema;
