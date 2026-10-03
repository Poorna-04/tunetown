import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import UndoToast from '../components/admin/UndoToast';
import { addToast } from '../features/ui/uiSlice';
import { deleteProduct, getProducts } from '../services/dataService';
import { deleteProductImage } from '../services/imageStore';
import { subscribeToServiceEvents } from '../services/serviceEvents';
import { formatRupees } from '../utils/format';

const pageSize = 10;

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'title', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = () =>
      getProducts({ limit: 1000 })
        .then(({ products: result }) => setProducts(result))
        .catch((loadError) => setError(loadError.message));
    loadProducts();
    return subscribeToServiceEvents((event) => {
      if (event.domain === 'products') loadProducts();
    });
  }, []);

  useEffect(() => {
    if (!pendingDelete) return undefined;
    const timer = window.setTimeout(async () => {
      try {
        await Promise.all(
          pendingDelete.products.map(async (product) => {
            await deleteProduct(product.id);
            await deleteProductImage(product.thumbnail);
          }),
        );
        dispatch(addToast({ message: 'Products deleted.' }));
      } catch (deleteError) {
        setError(deleteError.message);
      } finally {
        setPendingDelete(null);
      }
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [dispatch, pendingDelete]);

  const visibleProducts = useMemo(() => {
    const pendingIds = new Set(pendingDelete?.products.map(({ id }) => id) ?? []);
    const normalized = query.trim().toLocaleLowerCase();
    return products
      .filter((product) => !pendingIds.has(product.id))
      .filter((product) =>
        `${product.title} ${product.brand} ${product.category}`
          .toLocaleLowerCase()
          .includes(normalized),
      )
      .sort((left, right) => {
        const leftValue = left[sort.key];
        const rightValue = right[sort.key];
        const comparison =
          typeof leftValue === 'number'
            ? leftValue - rightValue
            : String(leftValue).localeCompare(String(rightValue));
        return sort.direction === 'asc' ? comparison : -comparison;
      });
  }, [pendingDelete, products, query, sort]);

  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const pageProducts = visibleProducts.slice((page - 1) * pageSize, page * pageSize);
  const allOnPageSelected =
    pageProducts.length > 0 && pageProducts.every(({ id }) => selected.has(id));

  function changeSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  function toggleSelected(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function scheduleBulkDelete() {
    const selectedProducts = products.filter(({ id }) => selected.has(id));
    if (!selectedProducts.length) return;
    setPendingDelete({ products: selectedProducts });
    setSelected(new Set());
  }

  return (
    <section aria-labelledby="products-title">
      <div className="admin-toolbar">
        <div>
          <h2 id="products-title">Products</h2>
          <p>{visibleProducts.length} products</p>
        </div>
        <label>
          Search products
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <button
          type="button"
          className="secondary-button"
          disabled={!selected.size}
          onClick={scheduleBulkDelete}
        >
          Delete selected ({selected.size})
        </button>
        <Link className="button-link" to="/admin/products/new">
          Add product
        </Link>
      </div>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="table-scroll">
        <table className="admin-table">
          <caption>Store catalogue products</caption>
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  aria-label="Select all products on this page"
                  checked={allOnPageSelected}
                  onChange={() => {
                    const ids = pageProducts.map(({ id }) => id);
                    setSelected((current) => {
                      const next = new Set(current);
                      ids.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)));
                      return next;
                    });
                  }}
                />
              </th>
              {[
                ['title', 'Title'],
                ['category', 'Category'],
                ['brand', 'Brand'],
                ['price', 'Price'],
                ['stock', 'Stock'],
              ].map(([key, label]) => (
                <th scope="col" key={key}>
                  <button type="button" className="table-sort" onClick={() => changeSort(key)}>
                    {label}
                    {sort.key === key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
              ))}
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${product.title}`}
                    checked={selected.has(product.id)}
                    onChange={() => toggleSelected(product.id)}
                  />
                </td>
                <th scope="row">{product.title}</th>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>{formatRupees(product.price)}</td>
                <td>{product.stock}</td>
                <td>
                  <Link to={`/admin/products/${product.id}/edit`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!pageProducts.length ? <p>No products match this search.</p> : null}
      {pageCount > 1 ? (
        <nav className="pagination" aria-label="Admin product pages">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
      {pendingDelete ? (
        <UndoToast count={pendingDelete.products.length} onUndo={() => setPendingDelete(null)} />
      ) : null}
    </section>
  );
}
