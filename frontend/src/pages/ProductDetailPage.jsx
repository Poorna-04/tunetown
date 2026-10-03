import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Tabs from '../components/common/Tabs';
import ProductCard from '../components/product/ProductCard';
import ProductImage from '../components/product/ProductImage';
import QuantityInput from '../components/product/QuantityInput';
import Reviews from '../components/product/Reviews';
import { useDeliveryLocation } from '../hooks/useDeliveryLocation';
import {
  loadProduct,
  productSelectors,
  refreshProduct,
  stockUpdated,
} from '../features/catalogue/catalogueSlice';
import { itemAdded, wishlistToggled } from '../features/shopping/shoppingSlice';
import { addToast } from '../features/ui/uiSlice';
import {
  addReview,
  getProducts,
  getRecentlyViewed,
  getReviews,
  getStock,
  saveRecentlyViewed,
} from '../services/dataService';
import { subscribeToServiceEvents } from '../services/serviceEvents';
import { deliveryDate, discountedPrice, formatRupees } from '../utils/format';

export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetailContent key={id} id={id} />;
}

function ProductDetailContent({ id }) {
  const dispatch = useDispatch();
  const product = useSelector((state) => productSelectors.selectById(state, id));
  const cart = useSelector((state) => state.shopping.cart);
  const wishlist = useSelector((state) => state.shopping.wishlist);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const quantityRef = useRef(null);
  const { pin } = useDeliveryLocation();
  const productId = product?.id;
  const productCategory = product?.category;
  const cartQuantity =
    cart.find(({ productId: cartProductId }) => cartProductId === id)?.quantity ?? 0;
  const availableStock = product ? Math.max(0, product.stock - cartQuantity) : 0;
  const selectedQuantity = availableStock > 0 ? Math.min(quantity, availableStock) : 1;

  useEffect(() => {
    if (product) return;
    const request = dispatch(loadProduct(id));
    request
      .unwrap()
      .catch((error) => {
        if (error.name !== 'AbortError') setNotFound(true);
      });
    return () => request.abort();
  }, [dispatch, id, product]);

  useEffect(() => {
    if (!productId) return undefined;
    let active = true;
    getReviews(productId)
      .then((result) => active && setReviews(result))
      .catch(() => active && setReviews([]));
    getProducts({ category: productCategory, limit: 5 })
      .then(({ products }) =>
        active &&
        setRelated(products.filter(({ id: relatedId }) => relatedId !== productId).slice(0, 4)),
      )
      .catch(() => active && setRelated([]));
    getRecentlyViewed()
      .then((ids) => {
        if (active)
          return saveRecentlyViewed([productId, ...ids.filter((recentId) => recentId !== productId)]);
        return undefined;
      })
      .catch(() => {});

    const timer = window.setInterval(() => {
      getStock(productId)
        .then((stock) => dispatch(stockUpdated(stock)))
        .catch(() => {});
    }, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [dispatch, productCategory, productId]);

  useEffect(
    () =>
      subscribeToServiceEvents((event) => {
        if (event.domain === 'products') dispatch(refreshProduct(id));
      }),
    [dispatch, id],
  );

  const galleryImages = product?.images ?? [];
  function moveImage(direction) {
    setSelectedImage(
      (current) => (current + direction + galleryImages.length) % galleryImages.length,
    );
  }

  async function submitReview(review) {
    const saved = await addReview(product.id, review);
    setReviews((current) => [saved, ...current]);
  }

  function toggleWishlist() {
    const isWished = wishlist.includes(product.id);
    dispatch(wishlistToggled(product.id));
    dispatch(addToast({ message: isWished ? 'Removed from wishlist.' : 'Saved to wishlist.' }));
  }

  if (notFound)
    return (
      <section className="page-section">
        <h1>Product not found</h1>
        <p>The requested product does not exist.</p>
        <Link to="/">Return to the catalogue</Link>
      </section>
    );
  if (!product)
    return (
      <section className="page-section" aria-busy="true">
        <h1>Loading product…</h1>
      </section>
    );

  return (
    <div className="detail-page">
      <div className="detail-main">
        <section
          className="gallery"
          aria-label={`${product.title} images`}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') moveImage(-1);
            if (event.key === 'ArrowRight') moveImage(1);
          }}
          tabIndex="0"
        >
          <ProductImage
            className="gallery-main"
            src={galleryImages[selectedImage]}
            alt={`${product.title}, image ${selectedImage + 1}`}
          />
          <div className="gallery-thumbnails">
            {galleryImages.map((image, index) => (
              <button
                type="button"
                key={image}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              >
                <ProductImage src={image} alt="" />
              </button>
            ))}
          </div>
        </section>
        <section className="purchase-panel">
          <p className="eyebrow">{product.brand}</p>
          <h1>{product.title}</h1>
          <p aria-label={`Rated ${product.rating} out of 5`}>★ {product.rating.toFixed(1)}</p>
          <p className="detail-price">{formatRupees(discountedPrice(product))}</p>
          {product.stock === 0 ? (
            <p className="stock-message--out">Out of stock</p>
          ) : availableStock === 0 ? (
            <p>All available units are in your cart</p>
          ) : (
            <p>{availableStock < 5 ? `Only ${availableStock} left` : 'In stock'}</p>
          )}
          <p>
            {pin
              ? `Delivers to ${pin} by ${deliveryDate()}`
              : 'Set a delivery PIN in the header to see a delivery date.'}
          </p>
          {availableStock ? (
            <>
              <QuantityInput
                ref={quantityRef}
                value={selectedQuantity}
                max={availableStock}
                onChange={setQuantity}
                onInvalid={() => quantityRef.current?.focusAndSelect()}
              />
              <div className="detail-actions">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(
                      itemAdded({
                        productId: product.id,
                        quantity: selectedQuantity,
                        stock: product.stock,
                      }),
                    );
                    dispatch(addToast({ message: 'Added to cart.' }));
                    setQuantity(1);
                  }}
                >
                  Add to cart
                </button>
                <button type="button" className="secondary-button" onClick={toggleWishlist}>
                  {wishlist.includes(product.id) ? '♥ In wishlist' : '♡ Add to wishlist'}
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
      <Tabs defaultValue="description">
        <Tabs.List label="Product information">
          <Tabs.Tab value="description">Description</Tabs.Tab>
          <Tabs.Tab value="specifications">Specifications</Tabs.Tab>
          <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="description">
          <p>{product.description}</p>
        </Tabs.Panel>
        <Tabs.Panel value="specifications">
          <dl className="spec-list">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Tabs.Panel>
        <Tabs.Panel value="reviews">
          <Reviews reviews={reviews} onSubmit={submitReview} />
        </Tabs.Panel>
      </Tabs>
      {related.length ? (
        <section className="recent-section" aria-labelledby="related-title">
          <h2 id="related-title">Related products</h2>
          <div className="product-row">
            {related.map((item) => (
              <ProductCard
                compact
                key={item.id}
                product={item}
                availableStock={Math.max(
                  0,
                  item.stock - (cart.find(({ productId }) => productId === item.id)?.quantity ?? 0),
                )}
                onAdd={() => dispatch(itemAdded({ productId: item.id, stock: item.stock }))}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

ProductDetailContent.propTypes = { id: PropTypes.string.isRequired };
