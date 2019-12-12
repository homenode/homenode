const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
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

      this.events.setMaxListeners(30);

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

      this.parser = this.conn.pipe(new Readline());

      // Setup listeners
      this.conn.on('error', (err) => {
        this.logger.error(err.message);
      });

      this.parser.on('data', (data) => {
        this.logger.debug('Incoming data: ', data);
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
  polling: {
    refreshStatus: {
      runAtStartup: true,
      secs: 3600,
      handler() {
        this.command('refresh');
      },
    },
  },
  commands: {
    send: {
      handler(data) {
        return new Promise((resolve, reject) => {
          this.logger.log('Writing Data: ', data.trim());

          this.events.once('incoming', (data) => {
            this.logger.log(`Response Received ${data}`);
            // This timeout helps buffer the command next command that might be sent to the amps
            setTimeout(() => {
              resolve();
            }, 100);
          });

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
        await this.command('send', `?10` + '\r\n');
        await this.command('send', `?20` + '\r\n');
        await this.command('send', `?30` + '\r\n');
      },
    },
  },
};
