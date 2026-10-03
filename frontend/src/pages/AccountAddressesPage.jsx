import { useEffect, useRef, useState } from 'react';
import AddressFields from '../components/checkout/AddressFields';
import { emptyAddress, validateAddress } from '../features/checkout/checkoutState';
import { createAddress, deleteAddress, getAddresses, updateAddress } from '../services/dataService';
import { subscribeToServiceEvents } from '../services/serviceEvents';

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [values, setValues] = useState({ ...emptyAddress });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    const load = () =>
      getAddresses()
        .then(setAddresses)
        .catch((error) => setMessage(error.message));
    load();
    return subscribeToServiceEvents((event) => {
      if (event.domain === 'addresses') load();
    });
  }, []);

  function clearForm() {
    setValues({ ...emptyAddress });
    setEditingId(null);
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateAddress(values, 'account');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() =>
        formRef.current?.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    try {
      if (editingId) await updateAddress(editingId, values);
      else await createAddress(values);
      setMessage(editingId ? 'Address updated.' : 'Address added.');
      clearForm();
    } catch (saveError) {
      setMessage(saveError.message);
    }
  }

  return (
    <section aria-labelledby="addresses-title">
      <div className="section-heading">
        <h2 id="addresses-title">Saved addresses</h2>
        <button type="button" className="secondary-button" onClick={clearForm}>
          Add address
        </button>
      </div>
      <div className="saved-addresses account-addresses">
        {addresses.map((address) => (
          <article className="saved-address" key={address.id}>
            <strong>{address.name}</strong>
            <span>
              {address.address}, {address.city} – {address.pin}
            </span>
            <div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingId(address.id);
                  setValues(
                    Object.fromEntries(
                      Object.keys(emptyAddress).map((key) => [key, address[key] ?? '']),
                    ),
                  );
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  deleteAddress(address.id).catch((error) => setMessage(error.message))
                }
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {!addresses.length ? <p>No saved addresses yet.</p> : null}

      <form ref={formRef} className="account-address-form" onSubmit={handleSubmit} noValidate>
        <AddressFields
          title={editingId ? 'Edit address' : 'New address'}
          prefix="account"
          values={values}
          errors={errors}
          onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
          onBlur={(field) => {
            const next = validateAddress(values, 'account');
            setErrors((current) => ({
              ...current,
              [`account.${field}`]: next[`account.${field}`] ?? '',
            }));
          }}
        />
        {message ? <p role="status">{message}</p> : null}
        <div className="checkout-actions">
          <button type="submit">{editingId ? 'Update address' : 'Save address'}</button>
          <button type="button" className="secondary-button" onClick={clearForm}>
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}
