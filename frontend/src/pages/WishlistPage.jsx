import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { loadCatalogue } from '../features/catalogue/catalogueSlice';
import { itemAdded, wishlistToggled } from '../features/shopping/shoppingSlice';
import { addToast } from '../features/ui/uiSlice';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.shopping.wishlist);
  const cart = useSelector((state) => state.shopping.cart);
  const entities = useSelector((state) => state.catalogue.entities);

  useEffect(() => {
    if (wishlist.some((id) => !entities[id])) dispatch(loadCatalogue({ limit: 1000 }));
  }, [dispatch, entities, wishlist]);

  const products = wishlist.map((id) => entities[id]).filter(Boolean);

  return (
    <section aria-labelledby="wishlist-title">
      <p className="eyebrow"></p>
      <h1 id="wishlist-title">Wishlist</h1>
      {!wishlist.length ? (
        <div className="empty-state">
          <h2>No saved products</h2>
          <Link className="button-link" to="/">
            Browse the catalogue
          </Link>
        </div>
      ) : null}
      {wishlist.length && !products.length ? <p aria-busy="true">Loading wishlist…</p> : null}
      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              availableStock={Math.max(
                0,
                product.stock -
                  (cart.find(({ productId }) => productId === product.id)?.quantity ?? 0),
              )}
              addLabel="Move to cart"
              wished
              onWishlist={() => {
                dispatch(wishlistToggled(product.id));
                dispatch(addToast({ message: 'Removed from wishlist.' }));
              }}
              onAdd={() => {
                dispatch(itemAdded({ productId: product.id, stock: product.stock }));
                dispatch(wishlistToggled(product.id));
                dispatch(addToast({ message: 'Moved to cart.' }));
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
