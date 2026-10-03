const localListeners = new Set();
const channel =
  typeof window !== 'undefined' && typeof window.BroadcastChannel === 'function'
    ? new window.BroadcastChannel('tunetown-data')
    : null;

function notifyListeners(event) {
  localListeners.forEach((listener) => listener(event));
}

if (channel) {
  channel.addEventListener('message', ({ data }) => notifyListeners(data));
}

/** Publish a small domain event; consumers reload authoritative data from the service. */
export function publishServiceEvent(domain) {
  const event = { domain, changedAt: Date.now() };
  notifyListeners(event);
  channel?.postMessage(event);
}

export function subscribeToServiceEvents(listener) {
  localListeners.add(listener);
  return () => localListeners.delete(listener);
}
