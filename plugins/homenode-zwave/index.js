const interfaceConfig = require('./interface.js');
const genericLightDimmerConfig = require('./devices/generic-dimmer-light-switch.js');
const genericLightSwitchConfig = require('./devices/generic-light-switch.js');

module.exports = function ZWave() {
  this.registerInterface(interfaceConfig);
  this.registerDevice(genericLightDimmerConfig);
  this.registerDevice(genericLightSwitchConfig);
};
