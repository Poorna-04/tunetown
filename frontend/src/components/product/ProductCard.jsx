import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { discountedPrice, formatRupees } from '../../utils/format';
import ProductImage from './ProductImage';

export default function ProductCard({
  product,
  onAdd,
  onWishlist,
  wished = false,
  compact = false,
  addLabel = 'Add to cart',
  availableStock,
}) {
  const hasDiscount = (product.discountPercentage ?? 0) > 0;
  const remainingStock = availableStock ?? product.stock;

  return (
    <article className={`product-card${compact ? ' product-card--compact' : ''}`}>
      <Link to={`/products/${product.id}`} className="product-card__image-link">
        <ProductImage
          className="product-card__image"
          src={product.thumbnail}
          alt={`${product.title} by ${product.brand}`}
        />
      </Link>
      <div className="product-card__body">
        <p className="product-card__brand">{product.brand}</p>
        <h2 className="product-card__title">
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h2>
        <p aria-label={`Rated ${product.rating} out of 5`}>★ {product.rating.toFixed(1)}</p>
        <div className="price-row">
          <strong>{formatRupees(discountedPrice(product))}</strong>
          {hasDiscount ? (
            <>
              <del>{formatRupees(product.price)}</del>
              <span className="discount-badge">{product.discountPercentage}% off</span>
            </>
          ) : null}
        </div>
        {product.stock === 0 ? (
          <p className="stock-message stock-message--out">Out of stock</p>
        ) : null}
        {product.stock > 0 && remainingStock === 0 ? (
          <p className="stock-message">All available units are in your cart</p>
        ) : null}
        {remainingStock > 0 && remainingStock < 5 ? (
          <p className="stock-message">Only {remainingStock} left</p>
        ) : null}
        <div className="product-card__actions">
          {onAdd ? (
            <button type="button" disabled={remainingStock === 0} onClick={() => onAdd(product)}>
              {addLabel}
            </button>
          ) : null}
          {onWishlist ? (
            <button
              type="button"
              className="icon-button"
              aria-label={`${wished ? 'Remove' : 'Add'} ${product.title} ${wished ? 'from' : 'to'} wishlist`}
              aria-pressed={wished}
              onClick={() => onWishlist(product)}
            >
              {wished ? '♥' : '♡'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    discountPercentage: PropTypes.number,
    rating: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
  }).isRequired,
  onAdd: PropTypes.func,
  onWishlist: PropTypes.func,
  wished: PropTypes.bool,
  compact: PropTypes.bool,
  addLabel: PropTypes.string,
  availableStock: PropTypes.number,
};
