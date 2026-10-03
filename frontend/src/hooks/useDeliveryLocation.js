import { useContext } from 'react';
import { DeliveryLocationContext } from '../context/deliveryLocationValue';

// Gives components access to the saved delivery PIN.
export function useDeliveryLocation() {
  const value = useContext(DeliveryLocationContext);
  if (!value) throw new Error('useDeliveryLocation must be used inside DeliveryLocationProvider.');
  return value;
}
