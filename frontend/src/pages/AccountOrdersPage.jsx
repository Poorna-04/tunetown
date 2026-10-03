import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/dataService';
import { subscribeToServiceEvents } from '../services/serviceEvents';
import { formatRupees } from '../utils/format';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = () => {
      setStatus('loading');
      getOrders()
        .then((result) => {
          setOrders(result);
          setStatus('ready');
        })
        .catch((loadError) => {
          setError(loadError.message);
          setStatus('failed');
        });
    };
    loadOrders();
    return subscribeToServiceEvents((event) => {
      if (event.domain === 'orders') loadOrders();
    });
  }, []);

  if (status === 'loading') return <p aria-busy="true">Loading orders…</p>;
  if (status === 'failed')
    return (
      <div className="error-panel" role="alert">
        <h2>Orders could not be loaded</h2>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );

  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title">Past orders</h2>
      {!orders.length ? (
        <div className="empty-state">
          <p>You have not placed an order yet.</p>
          <Link to="/">Start shopping</Link>
        </div>
      ) : null}
      <div className="account-order-list">
        {orders.map((order) => (
          <article key={order.id} className="account-order-card">
            <div>
              <strong>{order.id}</strong>
              <span>
                {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
                  new Date(order.placedAt),
                )}
              </span>
            </div>
            <div>
              <span>{order.items.length} item types</span>
              <strong>{formatRupees(order.totals?.grandTotal ?? 0)}</strong>
            </div>
            <Link to={`/orders/${order.id}`}>View order</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
