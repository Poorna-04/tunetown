import { NavLink, Outlet } from 'react-router-dom';

const accountLink = ({ isActive }) =>
  isActive ? 'account-link account-link--active' : 'account-link';

export default function AccountLayout() {
  return (
    <section aria-labelledby="account-title">
      <p className="eyebrow"></p>
      <h1 id="account-title">Your account</h1>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Account pages">
          <NavLink className={accountLink} to="orders">
            Orders
          </NavLink>
          <NavLink className={accountLink} to="addresses">
            Addresses
          </NavLink>
          <NavLink className={accountLink} to="preferences">
            Preferences
          </NavLink>
        </nav>
        <div className="account-content">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
