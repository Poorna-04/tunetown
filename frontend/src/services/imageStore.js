const DATABASE_NAME = 'tunetown-images';
const STORE_NAME = 'product-images';
const MARKER = 'idb:';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction(mode, operation) {
  return openDatabase().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = operation(transaction.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => database.close();
      }),
  );
}

export function isStoredImage(source) {
  return typeof source === 'string' && source.startsWith(MARKER);
}

export async function saveProductImage(file) {
  const id = crypto.randomUUID();
  await runTransaction('readwrite', (store) => store.put({ id, blob: file }));
  return `${MARKER}${id}`;
}

export function getProductImage(source) {
  if (!isStoredImage(source)) return Promise.resolve(null);
  return runTransaction('readonly', (store) => store.get(source.slice(MARKER.length))).then(
    (record) => record?.blob ?? null,
  );
}

export function deleteProductImage(source) {
  if (!isStoredImage(source)) return Promise.resolve();
  return runTransaction('readwrite', (store) => store.delete(source.slice(MARKER.length)));
}
