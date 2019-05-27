const events = require('events');
const _ = require('lodash');
const Datastore = require('../../lib/datastore.js');

const { noop, noopPromise } = require('../../lib/utils.js');

/**
 * This function will extend the passed in object with a traits api.
 *
 * @param obj - Object instance that is being extended
 */
module.exports = function TraitsMixin(obj) {
  obj.afterTraitChange = obj.structure.afterTraitChange || noop;
  obj.handleTraitChange = obj.structure.handleTraitChange || noopPromise;

  obj.traits = {};

  // Initialize
  obj.restoreTraits = () => {
    _.each(obj.structure.traits || [], (traitConfig, traitId) => {
      const defaultValue = (_.has(traitConfig, 'default') ? traitConfig.default : null);
      obj.traits[traitId] = obj.getOrInsertTrait(traitId, defaultValue);
      obj.logger.debug(`restoreTrait (${traitId}) to (${obj.traits[traitId].value})`);
    });
  };

  obj.getDatastoreTraitId = (traitId) => `${obj.interface_id}:${obj.id}:${traitId}`;

  obj.getOrInsertTrait = (traitId, defaultValue) => {
    const dbId = obj.getDatastoreTraitId(traitId);
    const currentRecord = Datastore.get('traits', dbId);

    if (currentRecord) {
      return currentRecord;
    }

    return Datastore.set('traits', dbId, defaultValue);
  };

  // Trys to handle the traitChange() and if successful then calls syncTrait() to capture the new
  // value.
  obj.setTrait = async (id, value) => {
    try {
      await obj.handleTraitChange(id, value);
    } catch (err) {
      obj.logger.error(`setTrait: (${id}) to (${value}) failed. Response: `, err);
    }

    obj.logger.debug(`setTrait: (${id}) to (${value})`);
    obj.syncTrait(id, value);
  };

  // Updates our local trait datastore, and triggers events
  obj.syncTrait = (id, value) => {
    obj.logger.debug(`syncTrait: (${id}) to (${value})`);

    const dbId = obj.getDatastoreTraitId(id);
    const currentRecord = Datastore.get('traits', dbId);
    const newRecord = Datastore.set('traits', dbId, value);

    obj.traits[id] = newRecord;

    if (currentRecord && currentRecord.value !== newRecord.value) {
      obj.triggerTraitChange(id, newRecord, currentRecord);

      obj.afterTraitChange.call(obj, id, newRecord, currentRecord);
    }
  };

  obj.getTrait = (id) => obj.traits[id] || null;

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
