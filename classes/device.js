const _ = require('lodash');
const events = require('events');
const Validator = require('../lib/validator.js');
const Datastore = require('../lib/datastore.js');
const noop = () => {};
const noopPromise = () => Promise.resolve();


module.exports = function deviceBaseClass(HomeNode, deviceConfig, instanceConfig) {
  this.id = instanceConfig.id;
  this.type = instanceConfig.type;
  this.interface_id = instanceConfig.interface_id;
  this.name = instanceConfig.name;
  this.interface = HomeNode.getInterface(this.interface_id);
  this.startup = deviceConfig.startup || noop;
  this.polling = deviceConfig.polling || {};
  this.shutdown = deviceConfig.shutdown || noop;
  this.afterTraitChange = deviceConfig.afterTraitChange || noop;
  this.handleTraitChange = deviceConfig.handleTraitChange || noopPromise;

  // TODO: Make a device define it's exposed events.

  /*
  Config
  TODO: This is gross. And just barely qualifies as validation.
   */
  const userProvidedConfig = instanceConfig.config || {};
  const deviceProvidedConfig = deviceConfig.config || {};
  const userProvidedConfigKeys = Object.keys(userProvidedConfig);
  const configGroups = _.reduce(deviceProvidedConfig, (list, propertySettings, propertyKey) => {
    if (propertySettings.required) {
      list.required.push(propertyKey);
    } else {
      list.optional.push(propertyKey);
    }
    return list;
  }, { required: [], optional: [] });

  Validator.validateKeys(`Device: ${this.id}`, userProvidedConfigKeys, configGroups.required, configGroups.optional);

  this.config = _.reduce((deviceConfig.config || {}), (computedConfig, propertySettings, propertyKey) => {
    computedConfig[propertyKey] = userProvidedConfig[propertyKey] || propertySettings['default'] || null;
    return computedConfig;
  }, {});

  this.getConfig = (id) => {
    if (!_.has(this.config, id)) {
      throw new Error(`Unknown getConfig() key (${id}) passed to device (${this.id})`);
    }
    return this.config[id];
  };


  /*
  Polling
   */

  this.runPoll = (id) => {
    const poll = this.polling[id];
    if (!poll.silent) {
      console.log(`System - Running poll (${id}) on device (${this.id})`);
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
    });
  };

  this.getDatastoreTraitId = (traitId) => {
    return `${this.interface_id}:${this.id}:${traitId}`;
  };

  this.getOrInsertTrait = (traitId, defaultValue) => {
    const dbId = this.getDatastoreTraitId(traitId);
    const currentRecord = Datastore.get('traits', dbId);

    if (currentRecord) {
      return currentRecord;
    }

    return Datastore.set('traits', dbId, defaultValue);
  };

  // Trys to handle the traitChange() and if successful then calls syncTrait() to capture the new value.
  this.setTrait = (id, value) => {
    return this.handleTraitChange(id, value).then(() => {
      this.syncTrait(id, value);
    }).catch((err) => {
      console.log(`ERROR - Unable to update device (${this.id}) trait (${id}) to value (${value}). Response:`, err);
    });
  };

  // Updates our local trait datastore, and triggers events
  this.syncTrait = (id, value) => {
    const dbId = this.getDatastoreTraitId(id);
    const currentRecord = Datastore.get('traits', dbId);
    const newRecord = Datastore.set('traits', dbId, value);

    this.traits[id] = newRecord;

    if (currentRecord && currentRecord.value !== newRecord.value) {
      this.triggerTraitChange(id, newRecord, currentRecord);

      this.afterTraitChange.call(this, id, newRecord, currentRecord);
    }
  };

  this.getTrait = (id) => {
    return this.traits[id] || null;
  };

  /*
  Events
   */

  this.events = new events.EventEmitter();

  this.triggerTraitChange = (traitId, newTrait, oldTrait) => {
    this.events.emit(`traitChange:${traitId}`, newTrait, oldTrait);
  };

  this.onTraitChange = (traitId, cb) => {
    this.events.on(`traitChange:${traitId}`, cb);
  };

  this.triggerEvent = (eventId, payload) => {
    this.events.emit(`event:${eventId}`, payload);
  };

  this.onEvent = (eventId, cb) => {
    this.events.on(`event:${eventId}`, cb);
  };


  return this;
};
