const STORAGE_PREFIX = 'tunetown:v1:';
const SCHEMA_VERSION = 1;

/** Return a copy so callers cannot accidentally mutate stored fallback values. */
function copy(value) {
  return structuredClone(value);
}

/**
 * Read and validate one versioned value. Damaged or outdated browser data is
 * ignored so a bad localStorage record cannot crash the application.
 */
export function readStoredValue(key, fallback, validate = () => true) {
  try {
    const rawValue = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!rawValue) return copy(fallback);

    const record = JSON.parse(rawValue);
    if (record.schemaVersion !== SCHEMA_VERSION || !validate(record.data)) {
      return copy(fallback);
    }

    return copy(record.data);
  } catch {
    return copy(fallback);
  }
}

/** Persist a copied value inside a small schema-version wrapper. */
export function writeStoredValue(key, value) {
  const record = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    data: copy(value),
  };

  window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(record));
  return copy(value);
}

/** Remove only TuneTown data and leave unrelated site storage untouched. */
export function clearTuneTownStorage() {
  const keysToRemove = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) keysToRemove.push(key);
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export function getStorageKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}
