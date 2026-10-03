import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDeliveryLocation } from '../../hooks/useDeliveryLocation';
import { useSession } from '../../hooks/useSession';

const navClassName = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link');

export default function Header() {
  const cartCount = useSelector((state) =>
    state.shopping.cart.reduce((sum, item) => sum + item.quantity, 0),
  );
  const wishlistCount = useSelector((state) => state.shopping.wishlist.length);
  const { pin, setPin } = useDeliveryLocation();
  const { role, setRole } = useSession();

  function handlePinSubmit(event) {
    event.preventDefault();
    const nextPin = new FormData(event.currentTarget).get('deliveryPin');
    if (/^\d{6}$/.test(nextPin)) setPin(nextPin);
  }

  return (
    <header className="site-header">
      <div className="header-row">
        <NavLink className="brand" to="/" aria-label="TuneTown home">
          TuneTown
        </NavLink>
        <p className="tagline">Instruments for every stage</p>
        <form className="pin-form" onSubmit={handlePinSubmit}>
          <label>
            Delivery PIN
            <input
              key={pin}
              name="deliveryPin"
              aria-label="Delivery PIN"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength="6"
              defaultValue={pin}
              placeholder="6-digit PIN"
            />
          </label>
          <button type="submit">Set</button>
        </form>
        <div className="header-actions" aria-label="Shopping shortcuts">
          <NavLink to="/wishlist">Wishlist{wishlistCount ? ` (${wishlistCount})` : ''}</NavLink>
          <NavLink to="/cart">
            Cart
            {cartCount ? (
              <span className="cart-badge" aria-label={`${cartCount} cart items`}>
                {cartCount}
              </span>
            ) : null}
          </NavLink>
        </div>
        <button
          type="button"
          className="role-switch secondary-button"
          disabled={!role}
          onClick={() => setRole(role === 'manager' ? 'shopper' : 'manager')}
        >
          {role === 'manager' ? 'Switch to Shopper' : 'Switch to Store manager'}
        </button>
      </div>
      <nav className="primary-nav" aria-label="Primary navigation">
        <NavLink className={navClassName} to="/">
          Shop
        </NavLink>
        <NavLink className={navClassName} to="/account/orders">
          Account
        </NavLink>
        <NavLink className={navClassName} to="/admin/products">
          Store manager
        </NavLink>
      </nav>
    </header>
  );
}
