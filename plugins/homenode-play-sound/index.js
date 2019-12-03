const player = require('play-sound')();

module.exports = function PlaySound() {
  /*
  Device
   */
  this.registerDevice({
    type: 'play-sound',
    commands: {
      play: {
        // Must provide the full system file path to the audio file
        handler(file) {
          return new Promise((resolve, reject) => {
            player.play(file, (err) => {
              if (err && err !== 1) { return reject(err); }
              resolve();
            });
          });
        },
      },
    },
  });
};
