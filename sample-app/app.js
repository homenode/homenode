const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('clock');
HomeNode.loadPlugin('virtuals');
HomeNode.loadPlugin('say');

// Clock
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

// Virtuals
HomeNode.interface({
  id: 'virtuals',
  plugin: 'virtuals',
  type: 'virtuals',
  name: 'Virtuals',
});

HomeNode.device({
  id: 'fake-switch',
  interface_id: 'virtuals',
  type: 'switch',
  name: 'My Fake Switch',
});

// Say
HomeNode.device({
  id: 'say',
  interface_id: 'robot',
  type: 'say',
  name: 'Mac Say',
});

// Spotify
// HomeNode.interface({
//   id: 'spotify',
//   plugin: 'spotify',
//   type: 'spotify-api',
//   name: 'Spotify',
//   config: {
//     client_id: 'a15c487a68434422bb9ece8e6f22639b',
//     client_secret: '25bfd77cd2ff44688a611d1f9f6cd2f8',
//     redirect_uri: 'http://walshhome.getmyip.com:8888/callback',
//     access_token:
// 'BQBkxrRN68S-IYL9EsKUATQOmdbVFzpFBn8GGtrclm6LDGclaUaV7jfhCU7ZGbDqZVdSOLM5ENALAaRdxvepmTNeyqKcvmHNi6cfM1M7NhQupUcmhlhPsOwJiZl9Ejp2c5ZpiDcSLI9XdI6DOBehzkQvgfvIUHhxz9dOfwTYUNiTNzUr-XBtNvM8wLqnkqMsDNdxKVSYe8q1EutFJk8S0TTtaBh4XLC38o8s7xiq2E9NyDN6xTCY74UEfSQCwXftKcMNJ0wla9x-I_OcLkIPMmAxAQ',
// refresh_token: 'AQBjtH4n4sJaemnQ6gjG6UUhOb7LMhGQasOn_ihDSvRYm98ffK1dgIM16BIeJd5YNhnxkqs2X-oHi5pB423C34WJmfIPuLLlXmTzFkrc9HeXvbKjgDRCJmZx31uf1kcCCsY8gA', }, });

// HomeNode.device({
//   id: 'spotify-justin',
//   interface_id: 'spotify',
//   type: 'spotify-account',
//   name: 'Justin\'s Spotify',
// });

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

// HomeNode.integrations.homekit.cleanup(); // Hard sync

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
