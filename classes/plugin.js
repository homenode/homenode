const _ = require('lodash');

module.exports = function pluginBaseClass(HomeNode, pluginType) {

  this.registerInterface = (config) => {
    config.plugin = pluginType;
    HomeNode.registerInterface(config);
  };

  this.registerDevice = (config) => {
    config.plugin = pluginType;
    HomeNode.registerDevice(config);
  };

  return this;
};
