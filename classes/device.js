const _ = require('lodash');
const noop = () => {};

module.exports = function deviceBaseClass(HomeNode, deviceConfig, instanceConfig) {
  this.id = instanceConfig.id;
  this.type = instanceConfig.type;
  this.interface_id = instanceConfig.interface_id;
  this.name = instanceConfig.name;
  this.config = instanceConfig.config || {};
  this.interface = HomeNode.getInterface(this.interface_id);

  // TODO: Validate Config
  // TODO: Apply Config Defaults

  this.startup = deviceConfig.startup || noop;
  this.polling = deviceConfig.polling || {};
  this.shutdown = deviceConfig.shutdown || noop;

  this.runPoll = (id) => {
    const poll = this.polling[id];
    if (!poll.silent) {
      console.log(`System - Running poll (${id}) on device (${this.id})`);
    }
    return this.polling[id].handler.call(this);
  };

  this.getConfig = (id) => {
    return this.config[id];
  };

  // Just sample trait tracking... not the real deal.

  this.traits = {};

  this.setTrait = (id, value) => {
    this.traits[id] = value;
  };

  this.getTrait = (id) => {
    return this.traits[id] || null;
  };

  return this;
};
