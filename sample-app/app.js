const HomeNode = require('../index.js');

HomeNode.setPluginPath('../plugins/');
HomeNode.enableHomekit({
  pincode: '429-42-927',
});
HomeNode.enableApi({
  port: '3000',
});

//const Clock = HomeNode.loadPlugin('clock');
const Virtuals = HomeNode.loadPlugin('virtuals');
//const Say = HomeNode.loadPlugin('say');

// // Clock
// Clock.device({
//   id: 'time',
//   type: 'time',
//   name: 'Time',
//   config: {
//     timezone: 'America/Chicago',
//     lat: 46.891295,
//     long: -100.834569,
//   },
// });

// Virtuals.device({
//   id: 'fake-amp-zone',
//   type: 'amp-zone',
//   name: 'Fake Amp Zone',
//   config: {
//     input_1: 'Living Room',
//     input_2: 'Master Bedroom',
//     input_3: 'Master Bathroom',
//     input_4: 'Bonus Room',
//     input_5: 'Cast',
//     input_6: 'Kids Cast',
//   },
// });

// Virtuals.device({
//   id: 'fake-speaker',
//   type: 'speaker',
//   name: 'Fake Speaker',
// });

// Virtuals.device({
//   id: 'fake-door-break',
//   type: 'switch',
//   name: 'Front Door',
// });

Virtuals.device({
  id: 'fake-door-break2',
  type: 'contact-sensor',
  name: 'Front Door Sensor',
});

// Virtuals.device({
//   id: 'fake-light-dimmer',
//   type: 'light-dimmer',
//   name: 'Fake Lightbulb',
// });

// Virtuals.device({
//   id: 'fake-tv',
//   type: 'tv',
//   name: 'Fake TV',
// });

// Say.device({
//   id: 'say',
//   type: 'say',
//   name: 'Mac Say',
// });

// HomeNode.automation({
//   id: 'turn-on-lights',
//   startup() {
//     setTimeout(() => {
//       this.trigger();
//     }, 3000);
//   },
//   trigger() {
//     // Do stuff
//     // boom; Test try/catch
//   },
// });

// // Automatically turn lights off after 15 mins
// HomeNode.automation({
//   id: 'turn-off-lights',
//   startup() {
//     HomeNode.getDevice('time').onTraitChange('time', (new_value, old_value) => {
//       // Nothing
//     });
//   },
//   trigger() {
//     // Do stuff
//   },
// });

HomeNode.tree();

const boot = async () => {
  await HomeNode.start();

  // const time = HomeNode.getDevice('time');
  //
  // time.onTraitChange('time', (newTrait, oldTrait) => {
  //   // Do Something
  // });
  //
  // time.setTrait('solarNoon', '10:15 pm');
  //
  // time.onEvent('solarNoon', () => {
  //   // Do Something
  // });
  //
  // const fakeSwitch = HomeNode.getDevice('fake-switch');
  //
  // fakeSwitch.onTraitChange('power', (newT, oldT) => {
  //   // Do Something
  // });
  //
  //
  // fakeSwitch.command('on');

  // setInterval(() => {
  //   const powerTrait = fakeSwitch.getTraitValue('power');
  //   fakeSwitch.setTrait('power', !powerTrait);
  // }, 10000);
};

boot();
