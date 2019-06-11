const interfaceConfig = require('./interface.js');
const genericSwitchConfig = require('./devices/generic-dimmer-light-switch.js');

module.exports = function ZWave() {
  this.registerInterface(interfaceConfig);
  this.registerDevice(genericSwitchConfig);
};
