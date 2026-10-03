import { describe, expect, it } from 'vitest';
import {
  checkoutReducer,
  createInitialCheckoutState,
  hasCheckoutInput,
  restoreCheckoutDraft,
  validateAddress,
  validatePayment,
} from './checkoutState';

const validAddress = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  phone: '9876543210',
  address: '12 Music Street',
  city: 'Bengaluru',
  pin: '560001',
};

describe('checkout state', () => {
  it('keeps address input while moving between steps', () => {
    let state = createInitialCheckoutState();
    state = checkoutReducer(state, {
      type: 'SET_ADDRESS_FIELD',
      section: 'delivery',
      field: 'name',
      value: 'Asha Rao',
    });
    state = checkoutReducer(state, { type: 'COMPLETE_STEP', step: 'address' });
    state = checkoutReducer(state, { type: 'SET_STEP', step: 'payment' });
    state = checkoutReducer(state, { type: 'SET_STEP', step: 'address' });

    expect(state.delivery.name).toBe('Asha Rao');
    expect(state.completed.address).toBe(true);
  });

  it('validates required address formats', () => {
    expect(validateAddress(validAddress, 'delivery')).toEqual({});
    expect(
      validateAddress({ ...validAddress, email: 'bad', phone: '12', pin: '4' }, 'delivery'),
    ).toMatchObject({
      'delivery.email': expect.any(String),
      'delivery.phone': expect.any(String),
      'delivery.pin': expect.any(String),
    });
  });

  it('validates card fields only for mock card payments', () => {
    expect(validatePayment({ paymentMethod: 'cod' })).toEqual({});
    expect(
      validatePayment(
        { paymentMethod: 'card', cardNumber: '1234', expiry: '2020-01', cvv: '1' },
        new Date('2026-09-27T00:00:00Z'),
      ),
    ).toMatchObject({
      cardNumber: expect.any(String),
      expiry: expect.any(String),
      cvv: expect.any(String),
    });
  });

  it('restores a saved checkout without restoring card details', () => {
    const restored = restoreCheckoutDraft({
      delivery: validAddress,
      paymentMethod: 'card',
      cardNumber: '1111222233334444',
      expiry: '2030-12',
      cvv: '123',
    });

    expect(restored.delivery).toEqual(validAddress);
    expect(restored.cardNumber).toBe('');
    expect(restored.expiry).toBe('');
    expect(restored.cvv).toBe('');
    expect(hasCheckoutInput(restored)).toBe(true);
  });
});
