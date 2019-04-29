const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('spotify');
HomeNode.loadPlugin('dax-amp');

HomeNode.registerConfig({
  devices: {
    'dax-amp': {
      config: {
        port: '/dev/cu.usbserial',
        mock: true,
      },
      kitchen: {
        name: 'Kitchen Speakers',
        amp: 1,
        zone: 1,
      },
      dining: {
        name: 'Dining Speakers',
        amp: 1,
        zone: 2,
      },
    },
  },
  scenes: {

  },
  activities: {

  },
  automations: {

  },
});

HomeNode.start();
