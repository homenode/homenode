const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('clock');

// Speakers
HomeNode.interface({
  id: 'time-machine',
  plugin: 'clock',
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


// HomeNode.getInterface('time-machine').startup();
// HomeNode.getDevice('time').startup();

HomeNode.start().then(() => {
  //console.log('After Startup Traits', HomeNode.getDevice('time').traits);

  // const Time = HomeNode.getDevice('time');
  //
  // Time.onTraitChange('time', (trait) => {
  //   console.log('time:', trait.new.value);
  // });
  //
  // Time.setTrait('solarNoon', '12:57 pm');
  //
  // Time.onEvent('solarNoon', () => {
  //   console.log('event: solarNoon!');
  // });
});
