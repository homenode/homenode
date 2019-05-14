const _ = require('lodash');
const events = require('events');
const Datastore = require('../lib/datastore.js');
const Logger = require('../lib/logger.js');
const { safeLogString, noop, noopPromise } = require('../lib/utils.js');

module.exports = function deviceClassClass(HomeNode, deviceConfig, instanceConfig) {
  this.id = instanceConfig.id;
  this.plugin = instanceConfig.plugin;
  this.type = instanceConfig.type;
  this.interface_id = instanceConfig.interface_id;
  this.name = instanceConfig.name;
  this.startup = deviceConfig.startup || noop;
  this.polling = deviceConfig.polling || {};
  this.shutdown = deviceConfig.shutdown || noop;
  this.afterTraitChange = deviceConfig.afterTraitChange || noop;
  this.handleTraitChange = deviceConfig.handleTraitChange || noopPromise;
  this.interface = (this.interface_id ? HomeNode.getInterface(this.interface_id) : null);

  this.logger = new Logger();
  this.logger.addPrefix(`Device (${this.id}):`);

  // TODO: Make a device define it's exposed events.

  /*
  Config
   */
  const userProvidedConfig = instanceConfig.config || {};
  const deviceProvidedConfig = deviceConfig.config || {};

  // Fill in defaults
  this.config = _.reduce(deviceProvidedConfig, (computedConfig, propertySettings, propertyKey) => {
    computedConfig[propertyKey] = userProvidedConfig[propertyKey] || propertySettings.default || null;
    return computedConfig;
  }, {});

  this.getConfig = (id) => {
    if (!_.has(this.config, id)) {
      throw new Error(`Unknown getConfig() key (${id})`);
    }
    return this.config[id];
  };

  /*
  Polling
   */

  this.runPoll = (id) => {
    const poll = this.polling[id];
    if (!poll.silent) {
      this.logger.log(`Running poll (${id})`);
    }
    return this.polling[id].handler.call(this);
  };

  /*
  Traits
   */

  this.traits = {};

  // Initialize
  this.restoreTraits = () => {
    _.each(deviceConfig.traits || [], (traitConfig, traitId) => {
      const defaultValue = (_.has(traitConfig, 'default') ? traitConfig.default : null);
      this.traits[traitId] = this.getOrInsertTrait(traitId, defaultValue);
      this.logger.debug(`restoreTrait (${traitId}) to (${this.traits[traitId].value})`);
    });
  };

  this.getDatastoreTraitId = (traitId) => `${this.interface_id}:${this.id}:${traitId}`;

  this.getOrInsertTrait = (traitId, defaultValue) => {
    const dbId = this.getDatastoreTraitId(traitId);
    const currentRecord = Datastore.get('traits', dbId);

    if (currentRecord) {
      return currentRecord;
    }

    return Datastore.set('traits', dbId, defaultValue);
  };

  // Trys to handle the traitChange() and if successful then calls syncTrait() to capture the new
  // value.
  this.setTrait = async (id, value) => {
    try {
      await this.handleTraitChange(id, value);
    } catch (err) {
      this.logger.error(`setTrait: (${id}) to (${value}) failed. Response: `, err);
    }

    this.logger.debug(`setTrait: (${id}) to (${value})`);
    this.syncTrait(id, value);
  };

  // Updates our local trait datastore, and triggers events
  this.syncTrait = (id, value) => {
    this.logger.debug(`syncTrait: (${id}) to (${value})`);

    const dbId = this.getDatastoreTraitId(id);
    const currentRecord = Datastore.get('traits', dbId);
    const newRecord = Datastore.set('traits', dbId, value);

    this.traits[id] = newRecord;

    if (currentRecord && currentRecord.value !== newRecord.value) {
      this.triggerTraitChange(id, newRecord, currentRecord);

      this.afterTraitChange.call(this, id, newRecord, currentRecord);
    }
  };

  this.getTrait = (id) => this.traits[id] || null;

  /*
  Events
   */

  this.events = new events.EventEmitter();

  this.triggerTraitChange = (traitId, newTrait, oldTrait) => {
    this.logger.log(`Trait Change: (${traitId}) from (${oldTrait.value}) to (${newTrait.value})`);
    this.events.emit(`traitChange:${traitId}`, newTrait, oldTrait);
  };

  this.onTraitChange = (traitId, cb) => {
    this.events.on(`traitChange:${traitId}`, cb);
  };

  this.triggerEvent = (eventId, payload) => {
    if (payload !== undefined) {
      this.logger.log(`Event Triggered: (${eventId}) with payload (${safeLogString(payload)})`);
    } else {
      this.logger.log(`Event Triggered: (${eventId})`);
    }
    this.events.emit(`event:${eventId}`, payload);
  };

  this.onEvent = (eventId, cb) => {
    this.events.on(`event:${eventId}`, cb);
  };

  return this;
};
