const SerialPort = require('serialport');

module.exports = {
  type: 'dax-amp',
  config: {
    port: {
      type: 'string',
      required: true,
    },
    baudRate: {
      type: 'integer',
      default: 9600,
    },
  },
  startup() {
    return new Promise((resolve, reject) => {
      const port = this.getConfig('port');
      const baudRate = this.getConfig('baudRate');

      this.conn = new SerialPort(port, {
        baudRate,
      }, (err) => {
        if (err) {
          this.logger.error('Port Open Error: ', err.message);
          return reject('Unable to open port');
        }

        this.logger.log(`Serial port is open`);

        resolve();
      });

      // Setup listeners
      this.conn.on('error', (err) => {
        this.logger.error(err.message);
      });

      // TODO: Move this to a shutdown method.
      process.on('SIGINT', () => {
        this.logger.log('Disconnecting...');
        this.conn.close();
        process.exit();
      });
    });
  },
  commands: {
    send: {
      handler(data) {
        return new Promise((resolve, reject) => {
          this.logger.log('Writing Data: ', data.trim());

          this.conn.write(data, (err) => {
            if (err) {
              this.logger.log('Write Error: ', err.message);
              return reject('Write Error');
            }

            this.logger.log('Write Completed');
            resolve();
          });
        });
      },
    },
  },
};
