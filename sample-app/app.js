const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('clock');

// Speakers
HomeNode.interface({
  id: 'time-machine',
  type: 'clock-service',
  name: 'Clock',
});

HomeNode.device({
  id: 'time',
  interface_id: 'time-machine',
  type: 'time',
  name: 'Time',
  config: {
    lat: 46.891295,
    long: -100.834569,
  },
});

HomeNode.tree();

HomeNode.instances.interfaces['time-machine'].startup();

//HomeNode.start();
