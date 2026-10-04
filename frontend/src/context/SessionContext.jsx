import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getSession, saveSession } from '../services/dataService';
import { subscribeToServiceEvents } from '../services/serviceEvents';
import { SessionContext } from './sessionValue';

export function SessionProvider({ children }) {
  const [role, setRoleState] = useState(null);

  useEffect(() => {
    const loadSession = () => getSession().then((session) => setRoleState(session.role));
    loadSession().catch(() => setRoleState('shopper'));
    return subscribeToServiceEvents((event) => {
      if (event.domain === 'session') loadSession().catch(() => {});
    });
  }, []);

  async function setRole(nextRole) {
    setRoleState(nextRole);
    try {
      const savedSession = await saveSession({ role: nextRole });
      setRoleState(savedSession.role);
      return savedSession.role;
    } catch {
      const session = await getSession();
      setRoleState(session.role);
      return session.role;
    }
  }

  return <SessionContext.Provider value={{ role, setRole }}>{children}</SessionContext.Provider>;
}

SessionProvider.propTypes = { children: PropTypes.node.isRequired };
