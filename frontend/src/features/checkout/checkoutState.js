export const emptyAddress = Object.freeze({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  pin: '',
});

export function createInitialCheckoutState() {
  return {
    step: 'address',
    delivery: { ...emptyAddress },
    billing: { ...emptyAddress },
    paymentMethod: 'cod',
    cardNumber: '',
    expiry: '',
    cvv: '',
    errors: {},
    completed: { address: false, payment: false },
  };
}

// Restore ordinary checkout fields, but always start card fields empty.
export function restoreCheckoutDraft(draft = {}) {
  const initial = createInitialCheckoutState();
  return {
    ...initial,
    ...draft,
    delivery: { ...initial.delivery, ...draft.delivery },
    billing: { ...initial.billing, ...draft.billing },
    completed: { ...initial.completed, ...draft.completed },
    cardNumber: '',
    expiry: '',
    cvv: '',
    errors: {},
  };
}

export function hasCheckoutInput(state) {
  return (
    Object.values(state.delivery).some(Boolean) ||
    Object.values(state.billing).some(Boolean) ||
    state.paymentMethod !== 'cod'
  );
}

// Keep all checkout field and step transitions in one predictable reducer.
export function checkoutReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'RESTORE_DRAFT':
      return restoreCheckoutDraft(action.draft);
    case 'SET_ADDRESS_FIELD':
      return {
        ...state,
        [action.section]: { ...state[action.section], [action.field]: action.value },
        errors: { ...state.errors, [`${action.section}.${action.field}`]: '' },
      };
    case 'SET_ADDRESS':
      return { ...state, [action.section]: { ...action.address } };
    case 'COPY_DELIVERY':
      return { ...state, billing: { ...state.delivery } };
    case 'SET_PAYMENT_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_FIELD_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.message } };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completed: { ...state.completed, [action.step]: true },
        errors: {},
      };
    default:
      return state;
  }
}

function required(value) {
  return String(value ?? '').trim().length > 0;
}

export function validateAddress(address, prefix) {
  const errors = {};
  if (!required(address.name)) errors[`${prefix}.name`] = 'Enter a name.';
  if (!required(address.email)) errors[`${prefix}.email`] = 'Enter an email address.';
  else if (!/^\S+@\S+\.\S+$/.test(address.email))
    errors[`${prefix}.email`] = 'Enter a valid email address.';
  if (!/^\d{10}$/.test(address.phone)) errors[`${prefix}.phone`] = 'Enter a 10-digit phone number.';
  if (!required(address.address)) errors[`${prefix}.address`] = 'Enter an address.';
  if (!required(address.city)) errors[`${prefix}.city`] = 'Enter a city.';
  if (!/^\d{6}$/.test(address.pin)) errors[`${prefix}.pin`] = 'Enter a 6-digit PIN code.';
  return errors;
}

export function isFutureExpiry(value, now = new Date()) {
  const [year, month] = String(value).split('-').map(Number);
  if (!year || !month) return false;
  const endOfExpiryMonth = new Date(year, month, 0, 23, 59, 59, 999);
  return endOfExpiryMonth > now;
}

export function validatePayment(state, now = new Date()) {
  if (state.paymentMethod === 'cod') return {};

  const errors = {};
  if (!/^\d{16}$/.test(state.cardNumber)) errors.cardNumber = 'Enter a 16-digit card number.';
  if (!isFutureExpiry(state.expiry, now)) errors.expiry = 'Choose a future expiry date.';
  if (!/^\d{3}$/.test(state.cvv)) errors.cvv = 'Enter a 3-digit CVV.';
  return errors;
}
