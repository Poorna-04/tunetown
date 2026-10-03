import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import CatalogueFilters from '../components/catalogue/CatalogueFilters';
import ErrorState from '../components/feedback/ErrorState';
import LoadingGrid from '../components/feedback/LoadingGrid';
import HeroCarousel from '../components/home/HeroCarousel';
import ProductCard from '../components/product/ProductCard';
import {
  loadCatalogue,
  productSelectors,
  refreshCatalogue,
} from '../features/catalogue/catalogueSlice';
import { itemAdded, wishlistToggled } from '../features/shopping/shoppingSlice';
import { addToast } from '../features/ui/uiSlice';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { getRecentlyViewed } from '../services/dataService';
import { subscribeToServiceEvents } from '../services/serviceEvents';

function readFilters(params) {
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    brands: params.getAll('brand'),
    minRating: params.get('rating') ?? '',
    minPrice: params.get('min') ?? '',
    maxPrice: params.get('max') ?? '',
    sort: params.get('sort') ?? 'relevance',
    page: Math.max(1, Number(params.get('page') ?? 1)),
  };
}

function createCatalogueQuery(queryString) {
  const filters = readFilters(new URLSearchParams(queryString));
  return {
    q: filters.q,
    category: filters.category || undefined,
    brands: filters.brands,
    minRating: filters.minRating || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    sort: filters.sort,
    skip: (filters.page - 1) * 12,
    limit: 12,
  };
}

// Keeps the typing state local and only updates the URL after a short pause.
function CatalogueSearch({ value, onCommit, inputRef }) {
  const [input, setInput] = useState(value);
  const debouncedInput = useDebouncedValue(input);

  useEffect(() => {
    if (debouncedInput !== value) onCommit(debouncedInput);
  }, [debouncedInput, onCommit, value]);

  return (
    <label className="search-field">
      Search products
      <input
        ref={inputRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Search title, brand or description"
      />
    </label>
  );
}

CatalogueSearch.propTypes = {
  value: PropTypes.string.isRequired,
  onCommit: PropTypes.func.isRequired,
  inputRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
};

export default function HomePage() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const queryString = params.toString();
  const filters = readFilters(params);
  const [recentIds, setRecentIds] = useState([]);
  const searchRef = useRef(null);
  const { listIds, categories, total, status, error } = useSelector((state) => state.catalogue);
  const entities = useSelector((state) => state.catalogue.entities);
  const allProducts = useSelector(productSelectors.selectAll);
  const cart = useSelector((state) => state.shopping.cart);
  const wishlist = useSelector((state) => state.shopping.wishlist);
  const products = useMemo(
    () => listIds.map((id) => entities[id]).filter(Boolean),
    [entities, listIds],
  );

  const brands = useMemo(
    () => [...new Set(allProducts.map(({ brand }) => brand))].sort(),
    [allProducts],
  );
  const counts = useMemo(() => {
    const result = { all: allProducts.length };
    allProducts.forEach(({ category }) => {
      result[category] = (result[category] ?? 0) + 1;
    });
    return result;
  }, [allProducts]);
  const recentProducts = recentIds
    .map((id) => allProducts.find((product) => product.id === id))
    .filter(Boolean);
  const cartQuantities = useMemo(
    () => Object.fromEntries(cart.map(({ productId, quantity }) => [productId, quantity])),
    [cart],
  );
  const catalogueQuery = useMemo(() => createCatalogueQuery(queryString), [queryString]);

  const updateParams = useCallback(
    (changes) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([key, value]) => {
        next.delete(key);
        if (Array.isArray(value)) value.forEach((item) => next.append(key, item));
        else if (value !== '' && value != null) next.set(key, String(value));
      });
      if (!Object.hasOwn(changes, 'page')) next.delete('page');
      setParams(next);
    },
    [params, setParams],
  );

  useEffect(() => {
    dispatch(loadCatalogue(catalogueQuery));
    return subscribeToServiceEvents((event) => {
      if (event.domain === 'products') dispatch(refreshCatalogue(catalogueQuery));
    });
  }, [catalogueQuery, dispatch]);

  useEffect(() => {
    getRecentlyViewed()
      .then(setRecentIds)
      .catch(() => setRecentIds([]));
  }, []);

  useEffect(() => {
    function focusSearch(event) {
      const tag = event.target.tagName;
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);

  function addToCart(product) {
    dispatch(itemAdded({ productId: product.id, stock: product.stock }));
    dispatch(addToast({ message: 'Added to cart.' }));
  }

  function toggleWishlist(product) {
    dispatch(wishlistToggled(product.id));
    dispatch(
      addToast({
        message: wishlist.includes(product.id) ? 'Removed from wishlist.' : 'Saved to wishlist.',
      }),
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / 12));
  const activeChips = [
    filters.category && ['category', filters.category],
    ...filters.brands.map((brand) => ['brand', brand]),
    filters.minRating && ['rating', `${filters.minRating}+ stars`],
    filters.minPrice && ['min', `From ₹${filters.minPrice}`],
    filters.maxPrice && ['max', `Up to ₹${filters.maxPrice}`],
  ].filter(Boolean);

  return (
    <div className="home-page">
      <HeroCarousel />
      <section aria-labelledby="catalogue-title">
        <div className="catalogue-toolbar">
          <div>
            <p className="eyebrow">Shop instruments</p>
            <h2 id="catalogue-title">Catalogue</h2>
          </div>
          <CatalogueSearch
            key={filters.q}
            value={filters.q}
            onCommit={(q) => updateParams({ q })}
            inputRef={searchRef}
          />
          <label>
            Sort
            <select
              value={filters.sort}
              onChange={(event) => updateParams({ sort: event.target.value })}
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
        {activeChips.length ? (
          <div className="filter-chips" aria-label="Active filters">
            {activeChips.map(([key, label]) => (
              <button
                type="button"
                key={`${key}-${label}`}
                onClick={() =>
                  key === 'brand'
                    ? updateParams({ brand: filters.brands.filter((brand) => brand !== label) })
                    : updateParams({ [key]: '' })
                }
              >
                {label} ×
              </button>
            ))}
            <button type="button" onClick={() => setParams({})}>
              Clear all
            </button>
          </div>
        ) : null}
        <div className="catalogue-layout">
          <CatalogueFilters
            values={filters}
            categories={categories}
            counts={counts}
            brands={brands}
            onChange={(key, value) =>
              updateParams({
                [key === 'brands'
                  ? 'brand'
                  : key === 'minRating'
                    ? 'rating'
                    : key === 'minPrice'
                      ? 'min'
                      : key === 'maxPrice'
                        ? 'max'
                        : key]: value,
              })
            }
            onClear={() => setParams({})}
          />
          <div>
            <p className="results-count" aria-live="polite">
              {total} results · Showing {products.length ? (filters.page - 1) * 12 + 1 : 0}–
              {Math.min(filters.page * 12, total)} of {total} products
            </p>
            {status === 'loading' || status === 'idle' ? <LoadingGrid /> : null}
            {status === 'failed' ? (
              <ErrorState message={error} onRetry={() => dispatch(loadCatalogue(catalogueQuery))} />
            ) : null}
            {status === 'succeeded' && !products.length ? (
              <div className="empty-state">
                <h3>No products match</h3>
                <p>Remove a filter or try another search.</p>
              </div>
            ) : null}
            {status === 'succeeded' && products.length ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    availableStock={Math.max(0, product.stock - (cartQuantities[product.id] ?? 0))}
                    onAdd={addToCart}
                    onWishlist={toggleWishlist}
                    wished={wishlist.includes(product.id)}
                  />
                ))}
              </div>
            ) : null}
            {status === 'succeeded' && pageCount > 1 ? (
              <nav className="pagination" aria-label="Product pages">
                <button
                  type="button"
                  disabled={filters.page === 1}
                  onClick={() => updateParams({ page: filters.page - 1 })}
                >
                  Previous
                </button>
                <span>
                  Page {filters.page} of {pageCount}
                </span>
                <button
                  type="button"
                  disabled={filters.page >= pageCount}
                  onClick={() => updateParams({ page: filters.page + 1 })}
                >
                  Next
                </button>
              </nav>
            ) : null}
          </div>
        </div>
      </section>
      {recentProducts.length ? (
        <section className="recent-section" aria-labelledby="recent-title">
          <h2 id="recent-title">Recently viewed</h2>
          <div className="product-row">
            {recentProducts.map((product) => (
              <ProductCard
                compact
                key={product.id}
                product={product}
                availableStock={Math.max(0, product.stock - (cartQuantities[product.id] ?? 0))}
                onAdd={addToCart}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
