const _ = require('lodash');

const Logger = require('../lib/logger.js');

module.exports = function pluginBaseClass(HomeNode, pluginType) {

  this.registerInterface = (config) => {
    config.plugin = pluginType;
    HomeNode.registerInterface(config);
  };

  this.registerDevice = (config) => {
    config.plugin = pluginType;
    HomeNode.registerDevice(config);
  };

  this.logger = new Logger();
  this.logger.addPrefix(`Plugin (${this.id}):`);

  return this;
};
