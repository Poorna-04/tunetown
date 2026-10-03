import { NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';

const adminLink = ({ isActive }) =>
  isActive ? 'account-link account-link--active' : 'account-link';

export default function AdminLayout() {
  const { role, setRole } = useSession();
  if (!role) return <p aria-busy="true">Checking store-manager access…</p>;
  if (role !== 'manager') {
    return (
      <section className="sign-in-prompt" aria-labelledby="manager-title">
        <p className="eyebrow">Module 8</p>
        <h1 id="manager-title">Store manager access</h1>
        <p>Switch to the Store manager role to continue to this page.</p>
        <button type="button" onClick={() => setRole('manager')}>
          Switch to Store manager
        </button>
      </section>
    );
  }
  return (
    <section aria-labelledby="admin-title">
      <p className="eyebrow">Module 8</p>
      <h1 id="admin-title">Store manager</h1>
      <nav className="account-nav admin-nav" aria-label="Store manager pages">
        <NavLink className={adminLink} to="products" end>
          Products
        </NavLink>
        <NavLink className={adminLink} to="products/new">
          Add product
        </NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
