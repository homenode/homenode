const say = require('say');

module.exports = function Spotify() {
  /*
  Interface
   */
  this.registerInterface({
    type: 'say',
  });

  /*
  Device
   */
  this.registerDevice({
    type: 'say',
    interface: 'say',
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
