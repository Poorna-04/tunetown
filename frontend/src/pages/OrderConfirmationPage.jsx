import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useParams } from 'react-router-dom';
import OrderItemsTable from '../components/checkout/OrderItemsTable';
import { cancelOrder, getOrders } from '../services/dataService';
import { getCancellationSeconds, getOrderStatusIndex } from '../utils/order';

const statuses = ['Placed', 'Packed', 'Shipped', 'Delivered'];

function fallbackTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 49;
  return { subtotal, gst, shipping, grandTotal: subtotal + gst + shipping };
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  return <OrderConfirmationContent key={orderId} orderId={orderId} />;
}

function OrderConfirmationContent({ orderId }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [now, setNow] = useState(null);

  useEffect(() => {
    let active = true;
    getOrders()
      .then((orders) => {
        if (!active) return;
        const found = orders.find(({ id }) => id === orderId);
        if (!found) navigate('/', { replace: true });
        else {
          setNow(Date.now());
          setOrder(found);
          setStatus('ready');
        }
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message);
        setStatus('failed');
      });
    return () => {
      active = false;
    };
  }, [navigate, orderId]);

  useEffect(() => {
    if (!order) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [order]);

  async function handleCancel() {
    try {
      const cancelled = await cancelOrder(order.id);
      setOrder(cancelled);
      setError('');
    } catch (cancelError) {
      setError(cancelError.message);
    }
  }

  if (status === 'loading') return <p aria-busy="true">Loading order…</p>;
  if (status === 'failed') {
    return (
      <section className="error-panel" role="alert">
        <h1>We could not load this order</h1>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </section>
    );
  }
  if (!order) return null;

  const currentTime = now ?? new Date(order.placedAt).getTime();
  const statusIndex = getOrderStatusIndex(order.placedAt, currentTime);
  const cancelSeconds = order.cancelledAt ? 0 : getCancellationSeconds(order.placedAt, currentTime);
  const totals = order.totals ?? fallbackTotals(order.items);

  return (
    <article className="confirmation-page" aria-labelledby="confirmation-title">
      <p className="eyebrow"></p>
      <h1 id="confirmation-title">Order confirmed</h1>
      <p>
        Thank you. Your order ID is <strong>{order.id}</strong>.
      </p>
      <p>
        Placed on{' '}
        {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
          new Date(order.placedAt),
        )}
      </p>

      {order.cancelledAt ? (
        <p className="cancelled-message" role="status">
          This order was cancelled.
        </p>
      ) : (
        <section aria-labelledby="tracking-title">
          <h2 id="tracking-title">Order tracking</h2>
          <ol className="status-tracker">
            {statuses.map((label, index) => (
              <li
                key={label}
                className={index <= statusIndex ? 'status-step--active' : ''}
                aria-current={index === statusIndex ? 'step' : undefined}
              >
                <span>{index + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        </section>
      )}

      <OrderItemsTable items={order.items} totals={totals} />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="confirmation-actions no-print">
        {cancelSeconds > 0 ? (
          <button type="button" className="secondary-button" onClick={handleCancel}>
            Cancel order ({cancelSeconds}s)
          </button>
        ) : null}
        <button type="button" onClick={() => window.print()}>
          Print invoice
        </button>
        <Link className="button-link secondary-button" to="/">
          Continue shopping
        </Link>
      </div>
    </article>
  );
}

OrderConfirmationContent.propTypes = { orderId: PropTypes.string.isRequired };
