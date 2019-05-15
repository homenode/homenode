const loki = require('lokijs');

let db;

const now = () => Math.floor(Date.now() / 1000);

const format = (record) => ({
  value: record.value,
  lastUpdated: record.lastUpdated,
  lastChanged: record.lastChanged,
});

module.exports = {
  startup: () => new Promise((resolve, reject) => {
    db = new loki('homenode.db', {
      autoload: true,
      autosave: true,
      autosaveInterval: 1000,
      autoloadCallback: () => {
        if (!db.getCollection('traits')) {
          console.log('Create traits table');
          db.addCollection('traits');
        }

        resolve();
      },
    });
  }),

  get: (collection, id) => {
    const table = db.getCollection(collection);
    const record = table.findOne({ id });

    return (record && format(record)) || null;
  },

  set: (collection, id, value) => {
    const table = db.getCollection(collection);
    const record = table.findOne({ id });
    const nowTimestamp = now();

    if (record) {
      // console.log('Updating record', collection, id, value);
      record.lastUpdated = nowTimestamp;

      // Track a timestamp if the value cahgnes
      if (record.value !== value) {
        record.lastChanged = nowTimestamp;
      }

      record.value = value;
      table.update(record);

      return format(record);
    }
    // console.log('Inserting record', collection, id, value);
    const newRecord = table.insert({
      id,
      value,
      lastUpdated: nowTimestamp,
      lastChanged: nowTimestamp,
    });

    return format(newRecord);
  },
};
