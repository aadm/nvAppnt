// Tiny IndexedDB wrapper for nvAppnt-idb
// Stores key-value pairs in named object stores (tables).
// Each store is independent; data persists across sessions.

const IDB_DB = 'nvAppnt';
const IDB_VERSION = 1;

let idbConn = null;

function idbOpen() {
  if (idbConn) return Promise.resolve(idbConn);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('content')) db.createObjectStore('content');
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images');
    };
    req.onsuccess = () => { idbConn = req.result; resolve(idbConn); };
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(store, key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(store, key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(store) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    const keyReq = tx.objectStore(store).getAllKeys();
    const result = {};
    keyReq.onsuccess = () => {
      const keys = keyReq.result;
      req.onsuccess = () => {
        const vals = req.result;
        for (let i = 0; i < keys.length; i++) result[keys[i]] = vals[i];
        resolve(result);
      };
    };
    keyReq.onerror = () => reject(keyReq.error);
  });
}

async function idbClear(store) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbKeys(store) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
