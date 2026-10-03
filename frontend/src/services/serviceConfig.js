const isProduction = import.meta.env.PROD;
const listeners = new Set();
const callLog = [];

const defaultSettings = Object.freeze({
  minDelay: Number(import.meta.env.VITE_SERVICE_MIN_DELAY ?? 300),
  maxDelay: Number(import.meta.env.VITE_SERVICE_MAX_DELAY ?? (isProduction ? 800 : 1200)),
  failureRate: Number(import.meta.env.VITE_SERVICE_FAILURE_RATE ?? 0),
});

let settings = { ...defaultSettings };
let hasRuntimeOverride = false;
let snapshot = createSnapshot();

function createSnapshot() {
  return {
    settings: { ...settings },
    hasRuntimeOverride,
    calls: [...callLog],
  };
}

function notify() {
  snapshot = createSnapshot();
  listeners.forEach((listener) => listener());
}

/** Subscribe to stable snapshots for React's useSyncExternalStore. */
export function subscribeToServiceConfig(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getServiceSnapshot() {
  return snapshot;
}

export function getServiceSettings() {
  return { ...settings, hasRuntimeOverride };
}

/** Clamp runtime values so the developer panel cannot create invalid settings. */
export function updateServiceSettings(nextSettings) {
  const minDelay = Math.max(0, Number(nextSettings.minDelay));
  const maxDelay = Math.max(minDelay, Number(nextSettings.maxDelay));
  const failureRate = Math.min(1, Math.max(0, Number(nextSettings.failureRate)));

  settings = { minDelay, maxDelay, failureRate };
  hasRuntimeOverride = true;
  notify();
  return getServiceSettings();
}

export function resetServiceSettings() {
  settings = { ...defaultSettings };
  hasRuntimeOverride = false;
  notify();
}

export function addServiceCall(entry) {
  callLog.unshift(entry);
  callLog.splice(50);
  notify();
}

export function clearServiceCalls() {
  callLog.length = 0;
  notify();
}
