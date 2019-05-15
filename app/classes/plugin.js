const _ = require('lodash');

const Logger = require('../lib/logger.js');

module.exports = function pluginClass(HomeNode, pluginType) {

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

  this.interface = (instanceConfig) => {
    instanceConfig.plugin = pluginType;
    return HomeNode.interface(instanceConfig);
  };

  this.device = (instanceConfig) => {
    instanceConfig.plugin = pluginType;
    return HomeNode.device(instanceConfig);
  };

  return this;
};
