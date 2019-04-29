const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('spotify');
HomeNode.loadPlugin('dax-amp');


// IDEA 1 Chaining

// newPlugin(pluginSlug, uniqueName, config)
const DaxAmp = HomeNode.newPlugin('dax-amp', 'speakers', {
  port: '/dev/cu.usbserial',
  mock: true,
});

// device(deviceType, uniqueName, config)
DaxAmp.device('zone', 'kitchen', {
  name: 'Kitchen Speakers',
  amp: 1,
  zone: 1,
});

// Example showing multiple device types in one plugin
const RingHouse = HomeNode.newPlugin('ring', 'ring-house', {
  key: 'A',
  secret: 'B',
});

RingHouse.device('ring-doorbell-pro', 'doorbell', {
  name: 'House Door Bell',
  identity: 'xyz123',
});

RingHouse.device('ring-outdoor-cam', 'side-door-cam', {
  name: 'Side Door Cam',
  identity: 'xyz123',
});

HomeNode.start();
