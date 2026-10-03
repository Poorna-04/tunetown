import { useTheme } from '../hooks/useTheme';

export default function AccountPreferencesPage() {
  const { theme, setTheme } = useTheme();
  return (
    <section aria-labelledby="preferences-title">
      <h2 id="preferences-title">Preferences</h2>
      <label className="preference-field">
        Theme
        <select value={theme} onChange={(event) => setTheme(event.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
      <p>The System option follows changes to your operating-system theme.</p>
    </section>
  );
}
