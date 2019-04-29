const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('spotify');
HomeNode.loadPlugin('dax-amp');
HomeNode.loadPlugin('ring');

HomeNode.remote({
  pusher: 'uri',
});

// Speakers
HomeNode.interface({
  id: 'speakers',
  type: 'dax-amp',
  name: 'Dax Amplifier',
  config: {
    port: '/dev/cu.usbserial',
    mock: true,
  }
});

HomeNode.device({
  id: 'kitchen',
  interface: 'speakers',
  type: 'zone',
  name: 'Kitchen Speakers',
  config: {
    amp: 1,
    zone: 1,
  },
});

// Ring
HomeNode.interface({
  id: 'ring-house',
  type: 'ring',
  name: 'House Ring',
  config: {
    key: 'A',
    secret: 'B',
  },
});

HomeNode.device({
  id: 'doorbell',
  interface: 'ring-house',
  type: 'ring-doorbell-pro',
  name: 'House Door Bell',
  config: {
    identity: 'xyz123',
  },
});

HomeNode.device({
  id: 'side-door-cam',
  interface: 'ring-house',
  type: 'ring-outdoor-cam',
  name: 'Side Door Cam',
  config: {
    identity: 'xyz123',
  },
});

HomeNode.start();
