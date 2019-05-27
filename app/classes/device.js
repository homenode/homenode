const Registry = require('../lib/registry.js');

const { noop } = require('../lib/utils.js');

const EventsMixin = require('./mixins/events.js');
const TraitsMixin = require('./mixins/traits.js');
const PollingMixin = require('./mixins/polling.js');
const ConfigMixin = require('./mixins/config.js');
const LoggingMixin = require('./mixins/logging.js');
const CommandsMixin = require('./mixins/commands.js');

module.exports = function deviceClass(structure, options) {
  /**
   * Structure is the definition of the device provided by the plugin
   */
  this.structure = structure;
  /**
   * Options are the parameters pass to this instance by the user
   */
  this.options = options;

  this.id = this.options.id;
  this.plugin = this.options.plugin;
  this.type = this.options.type;
  this.interface_id = this.options.interface_id;
  this.name = this.options.name;
  this.startup = this.structure.startup || noop;
  this.shutdown = this.structure.shutdown || noop;
  this.interface = (this.interface_id ? Registry.getInterface(this.interface_id) : null);

  LoggingMixin(this, 'Device');
  ConfigMixin(this);
  PollingMixin(this);
  TraitsMixin(this);
  EventsMixin(this);
  CommandsMixin(this);

  return this;
};
