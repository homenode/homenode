const Switch = require('./devices/switch.js');
const LightDimmer = require('./devices/light-dimmer.js');
const TV = require('./devices/tv.js');
const Speaker = require('./devices/speaker.js');
const AmpZone = require('./devices/amp-zone.js');

module.exports = function Virtuals() {
  this.registerDevice(Switch);
  this.registerDevice(LightDimmer);
  this.registerDevice(TV);
  this.registerDevice(Speaker);
  this.registerDevice(AmpZone);
};
