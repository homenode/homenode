const say = require('say');

module.exports = function Spotify() {
  /*
  Device
   */
  this.registerDevice({
    type: 'say',
    startup() {
      this.say = (text) => {
        return new Promise((resolve, reject) => {
          say.speak(text, undefined, undefined, (err) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      };
    },
  });
};
