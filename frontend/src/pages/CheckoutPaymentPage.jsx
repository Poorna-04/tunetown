import { useRef } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { validatePayment } from '../features/checkout/checkoutState';

export default function CheckoutPaymentPage() {
  const { state, dispatch, goToStep } = useOutletContext();
  const formRef = useRef(null);

  if (!state.completed.address) return <Navigate to="/checkout/address" replace />;

  function setField(field, value) {
    dispatch({ type: 'SET_PAYMENT_FIELD', field, value });
  }

  function validateField(field) {
    const errors = validatePayment(state);
    dispatch({ type: 'SET_FIELD_ERROR', field, message: errors[field] ?? '' });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const errors = validatePayment(state);
    dispatch({ type: 'SET_ERRORS', errors });
    if (Object.keys(errors).length) {
      window.requestAnimationFrame(() =>
        formRef.current?.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    dispatch({ type: 'COMPLETE_STEP', step: 'payment' });
    goToStep('review');
  }

  return (
    <form ref={formRef} className="checkout-form payment-form" onSubmit={handleSubmit} noValidate>
      <h2>Payment</h2>
      <fieldset>
        <legend>Payment method</legend>
        <label className="radio-card">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={state.paymentMethod === 'cod'}
            onChange={(event) => setField('paymentMethod', event.target.value)}
          />
          Cash on Delivery
        </label>
        <label className="radio-card">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={state.paymentMethod === 'card'}
            onChange={(event) => setField('paymentMethod', event.target.value)}
          />
          Mock card
        </label>
      </fieldset>

      {state.paymentMethod === 'card' ? (
        <div className="card-fields">
          <label htmlFor="card-number">
            Card number
            <input
              id="card-number"
              inputMode="numeric"
              maxLength="16"
              autoComplete="off"
              value={state.cardNumber}
              aria-invalid={Boolean(state.errors.cardNumber)}
              aria-describedby={state.errors.cardNumber ? 'card-number-error' : undefined}
              onChange={(event) => setField('cardNumber', event.target.value.replace(/\D/g, ''))}
              onBlur={() => validateField('cardNumber')}
            />
            {state.errors.cardNumber ? (
              <span id="card-number-error" className="form-error" role="alert">
                {state.errors.cardNumber}
              </span>
            ) : null}
          </label>
          <label htmlFor="card-expiry">
            Expiry
            <input
              id="card-expiry"
              type="month"
              autoComplete="off"
              value={state.expiry}
              aria-invalid={Boolean(state.errors.expiry)}
              aria-describedby={state.errors.expiry ? 'card-expiry-error' : undefined}
              onChange={(event) => setField('expiry', event.target.value)}
              onBlur={() => validateField('expiry')}
            />
            {state.errors.expiry ? (
              <span id="card-expiry-error" className="form-error" role="alert">
                {state.errors.expiry}
              </span>
            ) : null}
          </label>
          <label htmlFor="card-cvv">
            CVV
            <input
              id="card-cvv"
              inputMode="numeric"
              maxLength="3"
              autoComplete="off"
              value={state.cvv}
              aria-invalid={Boolean(state.errors.cvv)}
              aria-describedby={state.errors.cvv ? 'card-cvv-error' : undefined}
              onChange={(event) => setField('cvv', event.target.value.replace(/\D/g, ''))}
              onBlur={() => validateField('cvv')}
            />
            {state.errors.cvv ? (
              <span id="card-cvv-error" className="form-error" role="alert">
                {state.errors.cvv}
              </span>
            ) : null}
          </label>
          <p className="form-note">
            Mock card details are kept only on this page and are never stored.
          </p>
        </div>
      ) : null}

      <div className="checkout-actions">
        <button type="button" className="secondary-button" onClick={() => goToStep('address')}>
          Back
        </button>
        <button type="submit">Review order</button>
      </div>
    </form>
  );
}
