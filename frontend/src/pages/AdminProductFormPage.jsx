import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import PropTypes from 'prop-types';
import { Link, useBeforeUnload, useBlocker, useNavigate, useParams } from 'react-router-dom';
import Dialog from '../components/feedback/Dialog';
import ProductImage from '../components/product/ProductImage';
import {
  formatSpecifications,
  readProductForm,
  validateProduct,
} from '../features/admin/productForm';
import { createProduct, getProduct, updateProduct } from '../services/dataService';
import { deleteProductImage, saveProductImage } from '../services/imageStore';

function SaveButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save product'}</button>;
}

function FieldError({ message }) {
  return message ? <span className="form-error">{message}</span> : null;
}

FieldError.propTypes = { message: PropTypes.string };

function ProductForm({ product }) {
  const navigate = useNavigate();
  const dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
      [],
    ),
  );

  // Warn for refresh/close as well as links inside the app.
  useBeforeUnload(
    useCallback((event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    }, []),
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const [formState, formAction] = useActionState(
    async (_previous, formData) => {
      const values = readProductForm(formData);
      const imageFile = formData.get('image');
      const errors = validateProduct(values, imageFile, Boolean(product?.thumbnail));
      if (Object.keys(errors).length) return { errors, message: '' };

      let savedImage = '';
      try {
        if (imageFile?.size) savedImage = await saveProductImage(imageFile);
        const image = savedImage || product?.thumbnail;
        const changes = { ...values, thumbnail: image, images: [image] };
        const saved = product
          ? await updateProduct(product.id, changes)
          : await createProduct(changes);
        if (savedImage && product?.thumbnail) await deleteProductImage(product.thumbnail);
        dirtyRef.current = false;
        setDirty(false);
        navigate(`/admin/products/${saved.id}/edit`, { replace: true });
        return { errors: {}, message: 'Product saved.' };
      } catch (error) {
        if (savedImage) await deleteProductImage(savedImage);
        return { errors: {}, message: error.message };
      }
    },
    { errors: {}, message: '' },
  );

  function markDirty() {
    if (dirty) return;
    dirtyRef.current = true;
    setDirty(true);
  }

  function showPreview(event) {
    const file = event.target.files[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  }

  const error = (name) => formState.errors[name];

  return (
    <>
      <form className="product-form" action={formAction} onChange={markDirty}>
        <div className="product-form__fields">
          <label>
            Title
            <input
              name="title"
              defaultValue={product?.title}
              aria-invalid={Boolean(error('title'))}
            />
            <FieldError message={error('title')} />
          </label>
          <label>
            Brand
            <input
              name="brand"
              defaultValue={product?.brand}
              aria-invalid={Boolean(error('brand'))}
            />
            <FieldError message={error('brand')} />
          </label>
          <label>
            Category
            <input
              name="category"
              defaultValue={product?.category}
              aria-invalid={Boolean(error('category'))}
            />
            <FieldError message={error('category')} />
          </label>
          <label>
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.price}
              aria-invalid={Boolean(error('price'))}
            />
            <FieldError message={error('price')} />
          </label>
          <label>
            Discount %
            <input
              name="discountPercentage"
              type="number"
              min="0"
              max="100"
              defaultValue={product?.discountPercentage ?? 0}
              aria-invalid={Boolean(error('discountPercentage'))}
            />
            <FieldError message={error('discountPercentage')} />
          </label>
          <label>
            Rating
            <input
              name="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              defaultValue={product?.rating}
              aria-invalid={Boolean(error('rating'))}
            />
            <FieldError message={error('rating')} />
          </label>
          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock}
              aria-invalid={Boolean(error('stock'))}
            />
            <FieldError message={error('stock')} />
          </label>
          <label className="product-form__wide">
            Description
            <textarea
              name="description"
              rows="4"
              defaultValue={product?.description}
              aria-invalid={Boolean(error('description'))}
            />
            <FieldError message={error('description')} />
          </label>
          <label className="product-form__wide">
            Specifications <small>One “Key: Value” entry per line</small>
            <textarea
              name="specs"
              rows="6"
              defaultValue={formatSpecifications(product?.specs)}
              aria-invalid={Boolean(error('specs'))}
            />
            <FieldError message={error('specs')} />
          </label>
        </div>
        <div className="product-image-field">
          <label>
            Product image
            <input name="image" type="file" accept="image/*" onChange={showPreview} />
            <FieldError message={error('image')} />
          </label>
          {previewUrl || product?.thumbnail ? (
            <ProductImage
              className="image-preview"
              src={previewUrl || product.thumbnail}
              alt="Product preview"
            />
          ) : null}
        </div>
        {formState.message ? (
          <p role="alert" className="form-error">
            {formState.message}
          </p>
        ) : null}
        <div className="checkout-actions">
          <SaveButton />
          <Link className="secondary-button button-link" to="/admin/products">
            Cancel
          </Link>
        </div>
      </form>
      <Dialog
        open={blocker.state === 'blocked'}
        title="Discard unsaved changes?"
        onClose={() => blocker.reset?.()}
      >
        <p>Your changes have not been saved.</p>
        <div className="dialog-actions">
          <button type="button" onClick={() => blocker.proceed?.()}>
            Discard changes
          </button>
          <button type="button" className="secondary-button" onClick={() => blocker.reset?.()}>
            Keep editing
          </button>
        </div>
      </Dialog>
    </>
  );
}

ProductForm.propTypes = { product: PropTypes.object };

function EditProduct({ id }) {
  const [state, setState] = useState({ status: 'loading', product: null, error: '' });
  useEffect(() => {
    let active = true;
    getProduct(id)
      .then((product) => active && setState({ status: 'ready', product, error: '' }))
      .catch(
        (error) => active && setState({ status: 'failed', product: null, error: error.message }),
      );
    return () => {
      active = false;
    };
  }, [id]);
  if (state.status === 'loading') return <p aria-busy="true">Loading product…</p>;
  if (state.status === 'failed')
    return (
      <p role="alert" className="form-error">
        {state.error}
      </p>
    );
  return <ProductForm key={state.product.id} product={state.product} />;
}

EditProduct.propTypes = { id: PropTypes.string.isRequired };

export default function AdminProductFormPage() {
  const { id } = useParams();
  return (
    <section aria-labelledby="product-form-title">
      <h2 id="product-form-title">{id ? 'Edit product' : 'Add product'}</h2>
      {id ? <EditProduct id={id} /> : <ProductForm />}
    </section>
  );
}
