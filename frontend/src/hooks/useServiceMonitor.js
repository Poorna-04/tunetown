import { useSyncExternalStore } from 'react';
import { getServiceSnapshot, subscribeToServiceConfig } from '../services/serviceConfig';

/** Connect the development panel to service settings and its latest call log. */
export function useServiceMonitor() {
  return useSyncExternalStore(subscribeToServiceConfig, getServiceSnapshot, getServiceSnapshot);
}
