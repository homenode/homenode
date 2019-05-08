const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

const Clock = HomeNode.loadPlugin('clock');
HomeNode.loadPlugin('virtuals');
HomeNode.loadPlugin('say');

// Clock

Clock.interface({
  id: 'time-machine',
  type: 'clock-service',
  name: 'Clock',
});

Clock.device({
  id: 'time',
  interface_id: 'time-machine',
  type: 'time',
  name: 'Time',
  config: {
    lat: 46.891295,
    long: -100.834569,
  },
});

// Virtuals
const VI = HomeNode.interface({
  id: 'virtuals',
  plugin: 'virtuals',
  type: 'virtuals',
  name: 'Virtuals',
});

VI.device({
  id: 'fake-switch',
  type: 'switch',
  name: 'My Fake Switch',
});

// Say
VI.device({
  id: 'say',
  type: 'say',
  name: 'Mac Say',
});

HomeNode.automation({
  id: 'turn-on-lights',
  throttle: 2,
  startup() {
    setTimeout(() => {
      this.trigger();
    }, 1000);
  },
  trigger() {
    // Do stuff
  },
});

// Automatically turn lights off after 15 mins
HomeNode.automation({
  id: 'turn-off-lights',
  startup() {
    HomeNode.getDevice('time').onTraitChange('time', (new_value, old_value) => {
      // Nothing
    });
  },
  trigger() {
    // Do stuff
  },
});

HomeNode.tree();

HomeNode.start().then(() => {
  const Time = HomeNode.getDevice('time');

  Time.onTraitChange('time', (newTrait, oldTrait) => {
    //console.log('time:', newTrait.value, oldTrait.value);
  });

  Time.setTrait('solarNoon', '10:15 pm');

  Time.onEvent('solarNoon', () => {
    //console.log('event: solarNoon!');
  });

  const fakeSwitch = HomeNode.getDevice('fake-switch');

  fakeSwitch.onTraitChange('power', (newT, oldT) => {
    //console.log('SWITCH CHANGE!', newT, oldT);
  });

  const powerTrait = fakeSwitch.getTrait('power');

  fakeSwitch.setTrait('power', !powerTrait.value);
});
