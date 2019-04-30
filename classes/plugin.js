const _ = require('lodash');

module.exports = function pluginBaseClass(HomeNode) {

  this.registerInterface = HomeNode.registerInterface;

  this.registerDevice = HomeNode.registerDevice;

  return this;
};
