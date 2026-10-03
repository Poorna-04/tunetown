import { forwardRef, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';

const QuantityInput = forwardRef(function QuantityInput(
  { value, max, onChange, onInvalid, showAddFive = true },
  ref,
) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusAndSelect() {
      inputRef.current?.focus();
      inputRef.current?.select();
    },
  }));

  function update(nextValue) {
    const number = Number(nextValue);
    if (number > max) {
      onInvalid?.();
      return;
    }
    onChange(Math.max(1, number || 1));
  }

  return (
    <div className="quantity-input">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => update(value - 1)}
        disabled={value <= 1}
      >
        −
      </button>
      <label>
        Quantity
        <input
          ref={inputRef}
          type="number"
          min="1"
          max={max}
          value={value}
          onChange={(event) => update(event.target.value)}
        />
      </label>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => update(value + 1)}
        disabled={value >= max}
      >
        +
      </button>
      {showAddFive ? (
        <button type="button" onClick={() => update(value + 5)} disabled={value + 5 > max}>
          +5
        </button>
      ) : null}
    </div>
  );
});

QuantityInput.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onInvalid: PropTypes.func,
  showAddFive: PropTypes.bool,
};
export default QuantityInput;
