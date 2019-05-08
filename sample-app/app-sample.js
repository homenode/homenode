// Idea 1 - References
const Virtuals = HomeNode.loadPlugin('virtuals');

const VirtualsInterface = Virtuals.interface({
  id: 'virtuals',
  type: 'virtuals',
  name: 'Virtuals',
});

VirtualsInterface.device({
  id: 'fake-switch',
  type: 'switch',
  name: 'My Fake Switch',
});

// Idea 2 - Really the same as Option 1, but using chaining
HomeNode
  .loadPlugin('virtuals')
  .interface({
    id: 'virtuals',
    type: 'virtuals',
    name: 'Virtuals',
  })
  .device({
    id: 'fake-switch',
    type: 'switch',
    name: 'My Fake Switch',
  });

// Idea 3 - Remove the interface, it is unneeded for virtuals
const Virtuals = HomeNode.loadPlugin('virtuals');

Virtuals.device({
  id: 'fake-switch',
  type: 'switch',
  name: 'My Fake Switch',
});

// HomeNode.scene({
//   id: 'movie-time',
//   start: () => {
//
//   },
//   stop: () => {
//
//   },
// });

// Possible Homekit devoce spec
// homekit: {
//   'manufacture': 'Google Labs',
//   'model': '',
//   'serialNumber': '',
//
//   services: {
//     'lock-mech': {
//       service: Service.LockableDevice,
//       traits: {
//         currentState: {
//           characteristic: Characteristic.LockStatus,
//           values: {
//             true: 'Open',
//             false: 'Closed',
//           },
//         },
//         desiredState: {
//           characteristic: Characteristic.DesiredLockStatus,
//           mapTo: {
//             true: 'On',
//             false: 'Off',
//           },
//           mapFrom: {
//             'On': true,
//             'Opening': true,
//             'Off': false,
//           },
//         },
//       },
//     },
//     'motion-sensor': {},
//   },
//   events: {
//     'motion': {
//
//     }
//   }
// },
