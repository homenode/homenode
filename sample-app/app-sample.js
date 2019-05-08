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
