import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { loadCatalogue } from '../../features/catalogue/catalogueSlice';
import {
  checkoutReducer,
  createInitialCheckoutState,
  hasCheckoutInput,
} from '../../features/checkout/checkoutState';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  getCheckoutDraft,
  saveCheckoutDraft,
  updateAddress,
} from '../../services/dataService';
import { calculateOrderTotals, createOrderItems } from '../../utils/order';
import CheckoutProgress from './CheckoutProgress';
import { useDeliveryLocation } from '../../hooks/useDeliveryLocation';

const stepPaths = {
  address: '/checkout/address',
  payment: '/checkout/payment',
  review: '/checkout/review',
};

export default function CheckoutLayout() {
  const reduxDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const online = useOnlineStatus();
  const { pin } = useDeliveryLocation();
  const [state, dispatch] = useReducer(checkoutReducer, undefined, createInitialCheckoutState);
  const [addresses, setAddresses] = useState([]);
  const [addressError, setAddressError] = useState('');
  const [draftReady, setDraftReady] = useState(false);
  const allowLeave = useRef(false);
  const cart = useSelector((store) => store.shopping.cart);
  const hydrated = useSelector((store) => store.shopping.hydrated);
  const entities = useSelector((store) => store.catalogue.entities);

  const rows = useMemo(
    () =>
      cart
        .map((item) => ({ ...item, product: entities[item.productId] }))
        .filter(({ product }) => product),
    [cart, entities],
  );
  const totals = useMemo(() => calculateOrderTotals(rows), [rows]);
  const orderItems = useMemo(() => createOrderItems(rows), [rows]);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !allowLeave.current &&
      hasCheckoutInput(state) &&
      currentLocation.pathname.startsWith('/checkout') &&
      !nextLocation.pathname.startsWith('/checkout'),
  );

  useEffect(() => {
    let active = true;
    getCheckoutDraft()
      .then((draft) => {
        if (active && Object.keys(draft).length) dispatch({ type: 'RESTORE_DRAFT', draft });
      })
      .catch(() => {})
      .finally(() => active && setDraftReady(true));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Leave checkout? Your progress will be saved.')) {
      saveCheckoutDraft(state).finally(() => blocker.proceed());
    } else {
      blocker.reset();
    }
  }, [blocker, state]);

  useEffect(() => {
    const currentStep = location.pathname.split('/').at(-1);
    if (stepPaths[currentStep]) dispatch({ type: 'SET_STEP', step: currentStep });
  }, [location.pathname]);

  useEffect(() => {
    if (cart.some(({ productId }) => !entities[productId])) {
      reduxDispatch(loadCatalogue({ limit: 1000 }));
    }
  }, [cart, entities, reduxDispatch]);

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch((error) => setAddressError(error.message));
  }, []);

  function goToStep(step) {
    dispatch({ type: 'SET_STEP', step });
    navigate(stepPaths[step]);
  }

  async function saveAddress(address, id) {
    setAddressError('');
    try {
      const saved = id ? await updateAddress(id, address) : await createAddress(address);
      setAddresses((current) =>
        id ? current.map((item) => (item.id === id ? saved : item)) : [...current, saved],
      );
      return saved;
    } catch (error) {
      setAddressError(error.message);
      return null;
    }
  }

  async function removeAddress(id) {
    setAddressError('');
    try {
      await deleteAddress(id);
      setAddresses((current) => current.filter((address) => address.id !== id));
      return true;
    } catch (error) {
      setAddressError(error.message);
      return false;
    }
  }

  async function completeCheckout() {
    allowLeave.current = true;
    await saveCheckoutDraft({}).catch(() => {});
  }

  if (!hydrated || !draftReady) return <p aria-busy="true">Loading checkout…</p>;
  if (!cart.length) {
    return (
      <section className="empty-state">
        <h1>Your cart is empty</h1>
        <p>Add a product before starting checkout.</p>
        <Link className="button-link" to="/">
          Return to shopping
        </Link>
      </section>
    );
  }
  if (rows.length !== cart.length) return <p aria-busy="true">Loading checkout products…</p>;

  return (
    <section className="checkout-page" aria-labelledby="checkout-title">
      <p className="eyebrow"></p>
      <h1 id="checkout-title">Checkout</h1>
      <p>{pin ? `Delivery PIN from your account: ${pin}` : 'Set a delivery PIN in the header.'}</p>
      {!online ? (
        <p className="offline-banner" role="alert">
          You are offline. Reconnect before placing the order.
        </p>
      ) : null}
      <CheckoutProgress current={state.step} completed={state.completed} onStep={goToStep} />
      <Outlet
        context={{
          state,
          dispatch,
          goToStep,
          rows,
          totals,
          orderItems,
          online,
          addresses,
          addressError,
          saveAddress,
          removeAddress,
          completeCheckout,
        }}
      />
    </section>
  );
}
