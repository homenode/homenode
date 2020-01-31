const events = require('events');
const _ = require('lodash');
const Datastore = require('../../lib/datastore.js');

const { noop, noopPromise, forceType } = require('../../lib/utils.js');

/**
 * This function will extend the passed in object with a traits api.
 *
 * @param obj - Object instance that is being extended
 */
module.exports = function TraitsMixin(obj, storagePrefix) {
  obj.traits = {};

  // Initialize
  obj.restoreTraits = () => {
    _.each(obj.structure.traits || [], (traitConfig, traitId) => {
      const defaultValue = (_.has(traitConfig, 'default') ? traitConfig.default : null);
      obj.traits[traitId] = obj.getOrInsertTrait(traitId, defaultValue);

      // Trait Config Defaults
      if (!traitConfig.handleChange) {
        traitConfig.handleChange = noopPromise;
      }

      if (!traitConfig.afterChange) {
        traitConfig.afterChange = noop;
      }

      obj.logger.debug(`restoreTrait (${traitId}) to (${obj.traits[traitId].value})`);
    });
  };

  obj.getDatastoreTraitId = (traitId) => `${storagePrefix}:${obj.id}:${traitId}`;

  obj.getOrInsertTrait = (traitId, defaultValue) => {
    const dbId = obj.getDatastoreTraitId(traitId);
    const currentRecord = Datastore.get('traits', dbId);

    if (currentRecord) {
      return currentRecord;
    }

    return Datastore.set('traits', dbId, defaultValue);
  };

  obj.getTraitConfig = (id) => {
    if (obj.structure.traits && obj.structure.traits[id]) {
      return obj.structure.traits[id];
    } else {
      throw new Error(`Unknown traitId (${id}) passed to getTraitConfig()`);
    }
  };

  // Trys to handle the traitChange() and if successful then calls syncTrait() to capture the new
  // value.
  obj.setTrait = async (id, value) => {
    try {
      const config = obj.getTraitConfig(id);

      // Type coercion
      value = forceType(config.type, value);

      await config.handleChange.call(obj, value);

      obj.logger.debug(`setTrait: (${id}) to (${value})`);
      obj.syncTrait(id, value);
    } catch (err) {
      obj.logger.error(`setTrait: (${id}) to (${value}) failed. Response: `, err.stack || err);
    }
  };

  // Updates our local trait datastore, and triggers events
  obj.syncTrait = (id, value) => {
    const config = obj.getTraitConfig(id);

    // Type coercion
    value = forceType(config.type, value);

    obj.logger.debug(`syncTrait: (${id}) to (${value})`);

    const dbId = obj.getDatastoreTraitId(id);
    const currentRecord = Datastore.get('traits', dbId);
    const newRecord = Datastore.set('traits', dbId, value);

    obj.traits[id] = newRecord;

    if (currentRecord && currentRecord.value !== newRecord.value) {
      obj.triggerTraitChange(id, newRecord, currentRecord);

      try {
        config.afterChange.call(obj, newRecord, currentRecord);
      } catch (err) {
        obj.logger.error(`Trait (${id}) afterChange failed. Response: `, err.stack || err);
      }
    }
  };

  obj.getTrait = (id) => {
    if (obj.traits && obj.traits[id]) {
      return obj.traits[id];
    } else {
      throw new Error(`Unknown traitId (${id}) passed to getTrait()`);
    }
  };

  obj.getTraitValue = (id) => {
    const trait = obj.getTrait(id);
    return trait.value;
  };

  obj.getTraitLastChanged = (id) => {
    const trait = obj.getTrait(id);
    return trait.lastChanged;
  };

  obj.getTraitLastUpdated = (id) => {
    const trait = obj.getTrait(id);
    return trait.lastupdated;
  };

  // Events
  obj.traitEmitter = new events.EventEmitter();

  obj.triggerTraitChange = (traitId, newTrait, oldTrait) => {
    obj.logger.log(`Trait Change: (${traitId}) from (${oldTrait.value}) to (${newTrait.value})`);
    obj.traitEmitter.emit(`traitChange:${traitId}`, newTrait, oldTrait);
  };

  obj.onTraitChange = (traitId, cb) => {
    obj.traitEmitter.on(`traitChange:${traitId}`, cb);
  };
};
