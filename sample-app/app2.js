const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('dax-amp2');

HomeNode.tree();

// Speakers
HomeNode.interface({
  id: 'speakers',
  type: 'dax-amp',
  name: 'Dax Amplifier',
  config: {
    port: '/dev/cu.usbserial',
    mock: true,
    input_1: 'TV',
  },
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

//HomeNode.start();
