import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Dialog from '../components/feedback/Dialog';
import ProductImage from '../components/product/ProductImage';
import QuantityInput from '../components/product/QuantityInput';
import { loadCatalogue } from '../features/catalogue/catalogueSlice';
import { itemRemoved, quantityChanged } from '../features/shopping/shoppingSlice';
import { addToast } from '../features/ui/uiSlice';
import { discountedPrice, formatRupees } from '../utils/format';
import { useDeliveryLocation } from '../hooks/useDeliveryLocation';

export default function CartPage() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.shopping.cart);
  const entities = useSelector((state) => state.catalogue.entities);
  const [removeId, setRemoveId] = useState(null);
  const removeTriggerRef = useRef(null);
  const { pin } = useDeliveryLocation();

  useEffect(() => {
    if (cart.some(({ productId }) => !entities[productId]))
      dispatch(loadCatalogue({ limit: 1000 }));
  }, [cart, dispatch, entities]);

  const rows = cart
    .map((item) => ({ ...item, product: entities[item.productId] }))
    .filter(({ product }) => product);
  const subtotal = rows.reduce(
    (sum, { product, quantity }) => sum + discountedPrice(product) * quantity,
    0,
  );
  const savings = rows.reduce(
    (sum, { product, quantity }) => sum + (product.price - discountedPrice(product)) * quantity,
    0,
  );
  const gst = subtotal * 0.18;
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 49;

  function confirmRemoval() {
    dispatch(itemRemoved(removeId));
    dispatch(addToast({ message: 'Removed from cart.' }));
    setRemoveId(null);
  }

  return (
    <section aria-labelledby="cart-title">
      <p className="eyebrow"></p>
      <h1 id="cart-title">Shopping cart</h1>
      <p>{pin ? `Delivery location: ${pin}` : 'Set a delivery PIN in the header.'}</p>
      {!cart.length ? (
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <Link className="button-link" to="/">
            Continue shopping
          </Link>
        </div>
      ) : null}
      {cart.length && !rows.length ? <p aria-busy="true">Loading cart products…</p> : null}
      {rows.length ? (
        <div className="cart-layout">
          <div className="cart-list">
            {rows.map(({ product, quantity }) => (
              <article className="cart-row" key={product.id}>
                <ProductImage src={product.thumbnail} alt={product.title} />
                <div>
                  <h2>
                    <Link to={`/products/${product.id}`}>{product.title}</Link>
                  </h2>
                  <p>{product.brand}</p>
                  <strong>{formatRupees(discountedPrice(product))}</strong>
                </div>
                <QuantityInput
                  value={quantity}
                  max={product.stock}
                  showAddFive={false}
                  onChange={(next) =>
                    dispatch(quantityChanged({ productId: product.id, quantity: next }))
                  }
                />
                <button
                  ref={removeId === product.id ? removeTriggerRef : null}
                  type="button"
                  className="text-button"
                  onClick={(event) => {
                    removeTriggerRef.current = event.currentTarget;
                    setRemoveId(product.id);
                  }}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
          <aside className="order-summary" aria-label="Order totals">
            <h2>Summary</h2>
            <p>
              <span>Subtotal</span>
              <strong>{formatRupees(subtotal)}</strong>
            </p>
            <p>
              <span>GST (18%)</span>
              <strong>{formatRupees(gst)}</strong>
            </p>
            <p>
              <span>Shipping</span>
              <strong>{shipping ? formatRupees(shipping) : 'Free'}</strong>
            </p>
            <p>
              <span>You saved</span>
              <strong>{formatRupees(savings)}</strong>
            </p>
            <p className="grand-total">
              <span>Grand total</span>
              <strong>{formatRupees(subtotal + gst + shipping)}</strong>
            </p>
            <Link className="button-link" to="/checkout/address">
              Proceed to checkout
            </Link>
          </aside>
        </div>
      ) : null}
      <Dialog
        open={Boolean(removeId)}
        title="Remove this item?"
        onClose={() => setRemoveId(null)}
        triggerRef={removeTriggerRef}
      >
        <p>The product will be removed from your cart.</p>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={() => setRemoveId(null)}>
            Cancel
          </button>
          <button type="button" onClick={confirmRemoval}>
            Remove
          </button>
        </div>
      </Dialog>
    </section>
  );
}
