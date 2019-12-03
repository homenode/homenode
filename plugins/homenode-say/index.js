const say = require('say');

module.exports = function Say() {
  /*
  Device
   */
  this.registerDevice({
    type: 'say',
    commands: {
      speak: {
        /**
         * @param json object {text: 'Hello World', voice: 'bill', speed: 1}
         *
         * Speed: 1 = 100%, 0.5 = 50%, 2 = 200%, etc
         *
         */
        handler(json) {
          return new Promise((resolve, reject) => {
            say.speak(json.text, json.voice || 'Samantha', json.speed, (err) => {
              if (err) {
                return reject(err);
              }

              resolve();
            });
          });
        },
      },
    },
  });
};
