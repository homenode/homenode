const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('spotify');
HomeNode.loadPlugin('dax-amp');


// IDEA 4 Chaining + Object Config Hybrid

const DaxAmp = HomeNode.interface({
  id: 'speakers',
  type: 'dax-amp',
  name: 'Dax Amplifier',
  config: {
    port: '/dev/cu.usbserial',
    mock: true,
  },
});

DaxAmp.device({
  id: 'kitchen',
  type: 'zone',
  name: 'Kitchen Speakers',
  config: {
    amp: 1,
    zone: 1,
  },
});

// Example showing multiple device types in one plugin
const RingHouse = HomeNode.interface({
  id: 'ring-house',
  type: 'ring',
  name: 'House Ring',
  config: {
    key: 'A',
    secret: 'B',
  },
});

RingHouse.device({
  id: 'doorbell',
  type: 'ring-doorbell-pro',
  name: 'House Door Bell',
  config: {
    identity: 'xyz123',
  },
});

RingHouse.device({
  id: 'side-door-cam',
  type: 'ring-outdoor-cam',
  name: 'Side Door Cam',
  config: {
    identity: 'xyz123',
  },
});

// Could also chain the calls...

HomeNode.interface({
  id: 'ring-house',
  type: 'ring',
  name: 'House Ring',
  config: {
    key: 'A',
    secret: 'B',
  },
}).device({
  id: 'doorbell',
  type: 'ring-doorbell-pro',
  name: 'House Door Bell',
  config: {
    identity: 'xyz123',
  },
}).device({
  id: 'side-door-cam',
  type: 'ring-outdoor-cam',
  name: 'Side Door Cam',
  config: {
    identity: 'xyz123',
  },
});

HomeNode.start();
