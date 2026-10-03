import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getPreferences, savePreferences } from '../services/dataService';
import { subscribeToServiceEvents } from '../services/serviceEvents';
import { DeliveryLocationContext } from './deliveryLocationValue';

export function DeliveryLocationProvider({ children }) {
  const [pin, setPinState] = useState('');

  useEffect(() => {
    const loadPin = () =>
      getPreferences().then((preferences) => setPinState(preferences.deliveryPin));
    loadPin().catch(() => {});
    return subscribeToServiceEvents((event) => {
      if (event.domain === 'preferences') loadPin().catch(() => {});
    });
  }, []);

  function setPin(nextPin) {
    setPinState(nextPin);
    savePreferences({ deliveryPin: nextPin }).catch(() => setPinState(pin));
  }

  return (
    <DeliveryLocationContext.Provider value={{ pin, setPin }}>
      {children}
    </DeliveryLocationContext.Provider>
  );
}

DeliveryLocationProvider.propTypes = { children: PropTypes.node.isRequired };
