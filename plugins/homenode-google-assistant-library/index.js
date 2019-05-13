const request = require('request-promise-native');

function commandBuilder(host, port, message) {
  return `http://${host}:${port}/command?message=${message}`;
}

module.exports = function Clock() {
  this.registerDevice({
    type: 'google-assistant',
    config: {
      host: {
        type: 'text',
        required: true,
      },
      port: {
        type: 'integer',
        required: true,
      },
    },
    startup() {
      this.command = (textCommand) => {
        this.logger.log('Command:', textCommand);
        const url = commandBuilder(this.getConfig('host'), this.getConfig('port'), textCommand);

        return request(url);
      };
    },
    traits: {},

  });
};
