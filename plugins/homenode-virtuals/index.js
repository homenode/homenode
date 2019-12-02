const AmpZone = require('./devices/amp-zone.js');
const ContactSensor = require('./devices/contact-sensor.js');
const LightDimmer = require('./devices/light-dimmer.js');
const Speaker = require('./devices/speaker.js');
const Switch = require('./devices/switch.js');
const TV = require('./devices/tv.js');

module.exports = function Virtuals() {
  this.registerDevice(AmpZone);
  this.registerDevice(ContactSensor);
  this.registerDevice(LightDimmer);
  this.registerDevice(Speaker);
  this.registerDevice(Switch);
  this.registerDevice(TV);
};
