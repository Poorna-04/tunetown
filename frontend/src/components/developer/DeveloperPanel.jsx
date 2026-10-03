import { useState } from 'react';
import { useServiceMonitor } from '../../hooks/useServiceMonitor';
import { getProducts, resetAllData } from '../../services/dataService';
import {
  clearServiceCalls,
  resetServiceSettings,
  updateServiceSettings,
} from '../../services/serviceConfig';

export default function DeveloperPanel() {
  const { settings, calls } = useServiceMonitor();
  const [message, setMessage] = useState('');

  /** Apply form values together so the next service call sees one valid range. */
  function handleSettingsSubmit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    updateServiceSettings({
      minDelay: values.get('minDelay'),
      maxDelay: values.get('maxDelay'),
      failureRate: Number(values.get('failurePercent')) / 100,
    });
    setMessage('Service settings updated.');
  }

  async function handleResetData() {
    await resetAllData();
    setMessage('Stored TuneTown data was reset.');
  }

  async function handleTestCall() {
    setMessage('Running getProducts…');
    try {
      const result = await getProducts({ limit: 1 });
      setMessage(`Test succeeded. The catalogue contains ${result.total} products.`);
    } catch (error) {
      setMessage(`Test failed with status ${error.status ?? 500}.`);
    }
  }

  return (
    <aside className="developer-panel" aria-label="Developer controls">
      <details>
        <summary>Developer controls</summary>
        <form
          key={`${settings.minDelay}-${settings.maxDelay}-${settings.failureRate}`}
          className="developer-form"
          onSubmit={handleSettingsSubmit}
        >
          <label>
            Minimum delay in milliseconds
            <input name="minDelay" type="number" min="0" defaultValue={settings.minDelay} />
          </label>
          <label>
            Maximum delay in milliseconds
            <input name="maxDelay" type="number" min="0" defaultValue={settings.maxDelay} />
          </label>
          <label>
            Failure rate percentage
            <input
              name="failurePercent"
              type="number"
              min="0"
              max="100"
              defaultValue={settings.failureRate * 100}
            />
          </label>
          <div className="developer-actions">
            <button type="submit">Apply</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                resetServiceSettings();
                setMessage('Default service settings restored.');
              }}
            >
              Restore defaults
            </button>
            <button type="button" className="secondary-button" onClick={handleResetData}>
              Reset stored data
            </button>
            <button type="button" className="secondary-button" onClick={handleTestCall}>
              Run test call
            </button>
          </div>
        </form>
        <p className="developer-message" aria-live="polite">
          {message}
        </p>
        <div className="developer-log-heading">
          <strong>Latest service calls</strong>
          <button type="button" className="text-button" onClick={clearServiceCalls}>
            Clear log
          </button>
        </div>
        {calls.length ? (
          <ol className="service-log">
            {calls.map((call, index) => (
              <li key={`${call.name}-${call.duration}-${index}`}>
                <details>
                  <summary>
                    {call.name} · {call.duration} ms · {call.status}
                  </summary>
                  <pre>{JSON.stringify(call.args, null, 2)}</pre>
                  <p>{call.result}</p>
                </details>
              </li>
            ))}
          </ol>
        ) : (
          <p>No service calls yet.</p>
        )}
      </details>
    </aside>
  );
}
