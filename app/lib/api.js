const express = require('express');
const app = express();

const Logger = require('../lib/logger.js');
const Registry = require('../lib/registry.js');

let config = {};

const logger = new Logger();
logger.addPrefix('API:');

const deviceFields = [
  'id',
  'plugin',
  'type',
  'interface',
  'name',
  'traits',
  'config',
];

function deviceToJson(device) {
  const json = deviceFields.reduce((obj, fieldKey) => {
    obj[fieldKey] = device[fieldKey];
    return obj;
  }, {});

  return json;
}

/**
 * Middleware
 */
// parsing application/json
app.use(express.json());
// parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */

app.get('/', (req, res) => res.send('Homenode API Server!'));

app.get('/devices', (req, res) => {
  const devices = Registry.getType('device');

  const devicesJson = Object.keys(devices).reduce((json, deviceId) => {
    json[deviceId] = deviceToJson(devices[deviceId]);
    return json;
  }, {});

  res.json(devicesJson);
});

app.get('/devices/:id', (req, res) => {
  const deviceId = req.params.id;
  const device = Registry.getDevice(deviceId);

  const json = deviceToJson(device);

  res.json(json);
});

// Use this for triggering a full set command, this will try to update the device and trigger events.
app.post('/devices/:id/trait/:trait_id/set', async (req, res) => {
  if (req.body.value === undefined) {
    return res.json({ error: 'Must pass in a value query param' });
  }

  const deviceId = req.params.id;
  const device = Registry.getDevice(deviceId);

  const traitId = req.params.trait_id;
  const traitValue = req.body.value;

  logger.log(`Device trait set: (${deviceId}):(${traitId}) to (${traitValue})`);

  await device.setTrait(traitId, traitValue);

  const json = deviceToJson(device);

  res.json(json);
});

// Use this for triggering a sync command, this will not try to update the device but will still trigger events.
// This is useful for updating a device trait once it's already been changed, probably on the device itself.
app.post('/devices/:id/trait/:trait_id/sync', async (req, res) => {
  if (req.body.value === undefined) {
    return res.json({ error: 'Must pass in a value query param' });
  }

  const deviceId = req.params.id;
  const device = Registry.getDevice(deviceId);

  const traitId = req.params.trait_id;
  const traitValue = req.body.value;

  logger.log(`Device trait sync: (${deviceId}):(${traitId}) to (${traitValue})`);

  await device.syncTrait(traitId, traitValue);

  const json = deviceToJson(device);

  res.json(json);
});

module.exports = {
  config(options) {
    config = Object.assign({}, {
      port: '8000',
    }, options || {});
  },
  startup: () => new Promise((resolve, reject) => {
    logger.log(`Startup called, creating api server...`);

    app.listen(config.port, () => {
      logger.log(`Running on: http://localhost:${config.port}`);
      resolve();
    });
  }),
};
