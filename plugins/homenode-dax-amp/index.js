const interfaceConfig = require('./interface.js');
const deviceConfig = require('./device.js');

module.exports = function Dax() {
  this.registerInterface(interfaceConfig);
  this.registerDevice(deviceConfig);
};
