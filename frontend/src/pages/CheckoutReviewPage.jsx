import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import OrderItemsTable from '../components/checkout/OrderItemsTable';
import { cartCleared } from '../features/shopping/shoppingSlice';
import { getStock, placeOrder } from '../services/dataService';

function AddressSummary({ address }) {
  return (
    <address>
      {address.name}
      <br />
      {address.address}, {address.city} – {address.pin}
      <br />
      {address.email} · {address.phone}
    </address>
  );
}

AddressSummary.propTypes = { address: PropTypes.object.isRequired };

export default function CheckoutReviewPage() {
  const { state, goToStep, rows, totals, orderItems, online, completeCheckout } =
    useOutletContext();
  const reduxDispatch = useDispatch();
  const navigate = useNavigate();
  const submissionId = useRef(crypto.randomUUID());
  const placingLock = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shortages, setShortages] = useState([]);

  if (!state.completed.payment) return <Navigate to="/checkout/payment" replace />;

  async function handlePlaceOrder() {
    if (!online || placingLock.current) return;
    placingLock.current = true;
    setSubmitting(true);
    setError('');
    setShortages([]);

    try {
      // The brief requires one fresh stock call for every item immediately before ordering.
      const latestStock = await Promise.all(rows.map(({ product }) => getStock(product.id)));
      const unavailable = rows.filter(
        ({ product, quantity }) =>
          latestStock.find(({ id }) => id === product.id)?.stock < quantity,
      );
      if (unavailable.length) {
        setShortages(unavailable.map(({ product }) => product.title));
        return;
      }

      const result = await placeOrder({
        submissionId: submissionId.current,
        items: orderItems,
        totals,
        deliveryAddress: state.delivery,
        billingAddress: state.billing,
        paymentMethod: state.paymentMethod,
      });
      await completeCheckout();
      reduxDispatch(cartCleared());
      navigate(`/orders/${result.orderId}`, { replace: true });
    } catch (placeError) {
      setError(placeError.message || 'The order could not be placed. Please try again.');
    } finally {
      placingLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-review">
      <div className="section-heading">
        <h2>Review order</h2>
        <p>Check the details before placing your order.</p>
      </div>

      <div className="review-details">
        <section>
          <div className="section-heading">
            <h3>Delivery address</h3>
            <Link to="/checkout/address">Edit</Link>
          </div>
          <AddressSummary address={state.delivery} />
        </section>
        <section>
          <div className="section-heading">
            <h3>Billing address</h3>
            <Link to="/checkout/address">Edit</Link>
          </div>
          <AddressSummary address={state.billing} />
        </section>
        <section>
          <div className="section-heading">
            <h3>Payment</h3>
            <Link to="/checkout/payment">Edit</Link>
          </div>
          <p>{state.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Mock card'}</p>
        </section>
      </div>

      <OrderItemsTable items={orderItems} totals={totals} />

      {shortages.length ? (
        <div className="error-panel" role="alert">
          <h3>Some items no longer have enough stock</h3>
          <ul>
            {shortages.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
          <p>Return to your cart and reduce these quantities.</p>
        </div>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="checkout-actions no-print">
        <button type="button" className="secondary-button" onClick={() => goToStep('payment')}>
          Back
        </button>
        <button type="button" disabled={!online || submitting} onClick={handlePlaceOrder}>
          {submitting ? 'Placing order…' : error ? 'Retry place order' : 'Place order'}
        </button>
      </div>
    </div>
  );
}
