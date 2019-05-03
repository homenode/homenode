const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('clock');
HomeNode.loadPlugin('virtuals');

// HomeNode.homekit({
//   'pin': '123-23-456',
//   autoClean: true,
// });

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


// Automatically turn lights on, when motion is detected
HomeNode.automation({
  id: 'turn-on-lights', // Used for tracking/logging/external triggering
  debounce: 2, // Secs - Built in debouncer for multiple calls to trigger(); Trigger will be called when secs have elapsed without more triggers.
  startup() {
    // HomeNode.getDevice('front-door-ring-doorbell').onEvent('ring', () => {
    //   this.trigger();
    // });
    //
    // HomeNode.getDevice('front-door-ring-doorbell').onEvent('motion', () => {
    //   const lightPower = HomeNode.getDevice('front-door-soffit-lights').getTrait('power');
    //   const isOn = lightPower.value;
    //   const now = Math.floor(Date.now() / 1000);
    //   const secsAgoChanged = now - lightPower.lastChanged;
    //
    //   // Only trigger if the light is off, and it didn't just change
    //   if (!isOn && secsAgoChanged > 15) {
    //     this.trigger();
    //   }
    //
    // });
  },
  trigger() {
    //HomeNode.getDevice('front-door-soffit-lights').setTrait('power', true);
  },
});

// For Debugging
//HomeNode.getAutomation('turn-on-lights').trigger();

// Automatically turn lights off after 15 mins
HomeNode.automation({
  id: 'turn-off-lights',
  startup() {
    HomeNode.getDevice('time').onTraitChange('time', (new_value, old_value) => {
      //console.log('Automation startup: trait changed on time', new_value, old_value);
      //this.trigger();
    });
  },
  trigger() {
    //console.log("TRIGGERED");
  },
});

// HomeNode.integrations.homekit.cleanup(); // Hard sync


// HomeNode.scene({
//   id: 'movie-time',
//   start: () => {
//
//   },
//   stop: () => {
//
//   },
// });

HomeNode.tree();

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

  // const fakeSwitch = HomeNode.getDevice('fake-switch');
  //
  // fakeSwitch.onTraitChange('power', (newT, oldT) => {
  //   console.log('SWITCH CHANGE!', newT, oldT);
  // });
  //
  // const powerTrait = fakeSwitch.getTrait('power');
  //
  // fakeSwitch.setTrait('power', !powerTrait.value);

});
