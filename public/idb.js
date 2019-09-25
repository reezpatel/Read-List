// eslint-disable-next-line no-unused-vars
const idb = (() => {
  let db;

  function getDB() {
    if (!db) {
      db = new Promise((resolve, reject) => {
        const openreq = indexedDB.open("read-list", 1);

        openreq.onerror = () => {
          reject(openreq.error);
        };

        openreq.onupgradeneeded = () => {
          // First time setup: create an empty object store
          openreq.result.createObjectStore("list", { keyPath: "url" });
        };

        openreq.onsuccess = () => {
          resolve(openreq.result);
        };
      });
    }

    return db;
  }

  async function withStore(type, callback) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("list", type);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      callback(transaction.objectStore("list"));
    });
  }

  async function getAllItems() {
    return getDB().then(db => {
      return new Promise(async (resolve, reject) => {
        var trans = db.transaction("list", "readonly");
        var store = trans.objectStore("list");
        var items = [];

        trans.oncomplete = function() {
          resolve(items);
        };

        var cursorRequest = store.openCursor();

        cursorRequest.onerror = function(error) {
          reject(error);
        };

        cursorRequest.onsuccess = function(evt) {
          var cursor = evt.target.result;
          if (cursor) {
            items.push(cursor.value);
            cursor.continue();
          }
        };
      });
    });
  }

  return {
    async get(key) {
      let req;
      await withStore("readonly", store => {
        req = store.get(key);
      });
      return req.result;
    },
    set(key, value) {
      return withStore("readwrite", store => {
        store.put(value, key);
      });
    },
    add(item) {
      return withStore("readwrite", store => {
        store.add(item);
      });
    },
    delete(key) {
      return withStore("readwrite", store => {
        store.delete(key);
      });
    },
    getAll() {
      return getAllItems();
    },
    getDB: getDB
  };
})();
