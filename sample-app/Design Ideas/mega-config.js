const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('spotify');
HomeNode.loadPlugin('dax-amp');

HomeNode.registerConfig({
  plugins: {
    'dax-amp': { // Plugin Key
      speakers: { // Unique Instance ID (allows for multiple instances)
        config: { // Plugin Instance Specific Config
          port: '/dev/cu.usbserial',
          mock: true,
        },
        devices: { // Reserved Word
          zone: { // Device Type
            kitchen: { // Device Indentifer
              name: 'Kitchen Speakers', // Reserved Word
              amp: 1, // Custom config
              zone: 1,
            },
            dining: {
              name: 'Dining Speakers',
              amp: 1,
              zone: 2,
            },
          },
        },
      },
    },
    'ring': {
      ring: {
        config: {
          account: 'info',
        },
        devices: {
          'ring-doorbell-pro': {
            name: 'House Door Bell',
            identity: 'xyz123',
          },
          'ring-outdoor-cam': {
            name: 'Side Door Cam',
            identity: 'xyz123',
          },
        },
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
