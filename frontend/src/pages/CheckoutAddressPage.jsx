import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AddressFields from '../components/checkout/AddressFields';
import { emptyAddress, validateAddress } from '../features/checkout/checkoutState';

function addressFieldsOnly(address) {
  return Object.fromEntries(Object.keys(emptyAddress).map((key) => [key, address[key] ?? '']));
}

export default function CheckoutAddressPage() {
  const { state, dispatch, goToStep, addresses, addressError, saveAddress, removeAddress } =
    useOutletContext();
  const formRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');

  function changeAddress(section, field, value) {
    dispatch({ type: 'SET_ADDRESS_FIELD', section, field, value });
  }

  function blurAddress(section, field) {
    const errors = validateAddress(state[section], section);
    dispatch({
      type: 'SET_FIELD_ERROR',
      field: `${section}.${field}`,
      message: errors[`${section}.${field}`] ?? '',
    });
  }

  function focusFirstError() {
    window.requestAnimationFrame(() =>
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus(),
    );
  }

  function validateAddresses() {
    const errors = {
      ...validateAddress(state.delivery, 'delivery'),
      ...validateAddress(state.billing, 'billing'),
    };
    dispatch({ type: 'SET_ERRORS', errors });
    if (Object.keys(errors).length) focusFirstError();
    return !Object.keys(errors).length;
  }

  function handleContinue(event) {
    event.preventDefault();
    if (!validateAddresses()) return;
    dispatch({ type: 'COMPLETE_STEP', step: 'address' });
    goToStep('payment');
  }

  async function handleSaveAddress() {
    const errors = validateAddress(state.delivery, 'delivery');
    dispatch({ type: 'SET_ERRORS', errors });
    if (Object.keys(errors).length) {
      focusFirstError();
      return;
    }
    const saved = await saveAddress(state.delivery, editingId);
    if (!saved) return;
    dispatch({ type: 'SET_ADDRESS', section: 'delivery', address: addressFieldsOnly(saved) });
    setEditingId(saved.id);
    setSavedMessage('Delivery address saved.');
  }

  function selectSavedAddress(address) {
    dispatch({ type: 'SET_ADDRESS', section: 'delivery', address: addressFieldsOnly(address) });
    setEditingId(address.id);
    setSavedMessage('Saved address selected.');
  }

  return (
    <form ref={formRef} className="checkout-form" onSubmit={handleContinue} noValidate>
      <div className="section-heading">
        <div>
          <h2>Address</h2>
          <p>Choose a saved address or enter a new delivery and billing address.</p>
        </div>
      </div>

      {addresses.length ? (
        <section aria-labelledby="saved-address-title">
          <h3 id="saved-address-title">Saved addresses</h3>
          <div className="saved-addresses">
            {addresses.map((address) => (
              <article key={address.id} className="saved-address">
                <strong>{address.name}</strong>
                <span>
                  {address.address}, {address.city} – {address.pin}
                </span>
                <div>
                  <button type="button" onClick={() => selectSavedAddress(address)}>
                    Use
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => selectSavedAddress(address)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={async () => {
                      const removed = await removeAddress(address.id);
                      if (removed && editingId === address.id) setEditingId(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="address-form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setEditingId(null);
            setSavedMessage('');
            dispatch({ type: 'SET_ADDRESS', section: 'delivery', address: { ...emptyAddress } });
          }}
        >
          Add new address
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => dispatch({ type: 'COPY_DELIVERY' })}
        >
          Copy delivery to billing
        </button>
      </div>

      {Object.keys(state.errors).length ? (
        <p className="form-error" role="alert">
          Please correct the highlighted address fields.
        </p>
      ) : null}
      {addressError ? (
        <p className="form-error" role="alert">
          {addressError}
        </p>
      ) : null}
      {savedMessage ? <p role="status">{savedMessage}</p> : null}

      <div className="address-grid">
        <AddressFields
          title="Delivery address"
          prefix="delivery"
          values={state.delivery}
          errors={state.errors}
          onChange={(field, value) => changeAddress('delivery', field, value)}
          onBlur={(field) => blurAddress('delivery', field)}
        />
        <AddressFields
          title="Billing address"
          prefix="billing"
          values={state.billing}
          errors={state.errors}
          onChange={(field, value) => changeAddress('billing', field, value)}
          onBlur={(field) => blurAddress('billing', field)}
        />
      </div>

      <div className="checkout-actions">
        <button type="button" className="secondary-button" onClick={handleSaveAddress}>
          {editingId ? 'Update saved address' : 'Save delivery address'}
        </button>
        <button type="submit">Continue to payment</button>
      </div>
    </form>
  );
}
