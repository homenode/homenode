const { noop } = require('../lib/utils.js');

const EventsMixin = require('./mixins/events.js');
const TraitsMixin = require('./mixins/traits.js');
const PollingMixin = require('./mixins/polling.js');
const ConfigMixin = require('./mixins/config.js');
const LoggingMixin = require('./mixins/logging.js');
const CommandsMixin = require('./mixins/commands.js');

module.exports = function interfaceClass(Plugin, structure, options) {
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
  this.name = this.options.name;
  this.startup = this.structure.startup || noop;
  this.shutdown = this.structure.shutdown || noop;

  LoggingMixin(this, 'Interface');
  ConfigMixin(this);
  PollingMixin(this);
  TraitsMixin(this, 'interface');
  EventsMixin(this);
  CommandsMixin(this);

  this.device = (deviceConfig) => {
    deviceConfig.plugin = this.plugin;
    deviceConfig.interface_id = this.id;
    return Plugin.device(deviceConfig);
  };

  return this;
};
