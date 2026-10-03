import { createContext, useContext, useId, useState } from 'react';
import PropTypes from 'prop-types';

const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [activeValue, setActiveValue] = useState(defaultValue);
  const id = useId();
  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue, id }}>
      {children}
    </TabsContext.Provider>
  );
}

function List({ children, label }) {
  function handleKeyDown(event) {
    const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex < 0) return;
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  }

  return (
    <div role="tablist" aria-label={label} className="tabs-list" onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

function Tab({ value, children }) {
  const context = useContext(TabsContext);
  const selected = context.activeValue === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${context.id}-tab-${value}`}
      aria-controls={`${context.id}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={() => context.setActiveValue(value)}
    >
      {children}
    </button>
  );
}

function Panel({ value, children }) {
  const context = useContext(TabsContext);
  return (
    <section
      role="tabpanel"
      id={`${context.id}-panel-${value}`}
      aria-labelledby={`${context.id}-tab-${value}`}
      hidden={context.activeValue !== value}
      tabIndex="0"
      className="tabs-panel"
    >
      {children}
    </section>
  );
}

Tabs.List = List;
Tabs.Tab = Tab;
Tabs.Panel = Panel;

Tabs.propTypes = { defaultValue: PropTypes.string.isRequired, children: PropTypes.node.isRequired };
List.propTypes = { children: PropTypes.node.isRequired, label: PropTypes.string.isRequired };
Tab.propTypes = { value: PropTypes.string.isRequired, children: PropTypes.node.isRequired };
Panel.propTypes = { value: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export default Tabs;
