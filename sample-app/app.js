const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

const Clock = HomeNode.loadPlugin('clock');
const Virtuals = HomeNode.loadPlugin('virtuals');
const Say = HomeNode.loadPlugin('say');

// Clock
Clock.device({
  id: 'time',
  type: 'time',
  name: 'Time',
  config: {
    lat: 46.891295,
    long: -100.834569,
  },
});

Virtuals.device({
  id: 'fake-switch',
  type: 'switch',
  name: 'My Fake Switch',
});

Say.device({
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
    }, 3000);
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

const boot = async () => {
  await HomeNode.start();

  const time = HomeNode.getDevice('time');

  time.onTraitChange('time', (newTrait, oldTrait) => {
    // Do Something
  });

  time.setTrait('solarNoon', '10:15 pm');

  time.onEvent('solarNoon', () => {
    // Do Something
  });

  const fakeSwitch = HomeNode.getDevice('fake-switch');

  fakeSwitch.onTraitChange('power', (newT, oldT) => {
    // Do Something
  });

  const powerTrait = fakeSwitch.getTrait('power');

  fakeSwitch.setTrait('power', !powerTrait.value);
};

boot();
