const SerialPort = require('serialport');
const EventEmitter = require('events');

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

      this.events = new EventEmitter();

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

      this.conn.on('data', (data) => {
        data = data.replace('#', '');

        console.log('DAX Data:', data);

        this.events.emit('incoming', data);
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

          if (data[0] !== '?') {
            this.events.once('incoming', (data) => {
              this.logger.log(`Response Received ${data}`);
              resolve();
            });
          }

          this.conn.write(data, (err) => {
            if (err) {
              this.logger.log('Write Error: ', err.message);
              return reject('Write Error');
            }

            this.logger.log('Write Completed');
          });
        });
      },
    },
    refresh: {
      async handler() {
        await this.interface.command('send', `?10` + '\r\n');
        await this.interface.command('send', `?20` + '\r\n');
        await this.interface.command('send', `?30` + '\r\n');
      },
    },
  },
};
