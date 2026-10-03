import PropTypes from 'prop-types';

const fields = [
  { name: 'name', label: 'Full name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', inputMode: 'numeric', autoComplete: 'tel' },
  { name: 'address', label: 'Address', autoComplete: 'street-address' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'pin', label: 'PIN code', inputMode: 'numeric', autoComplete: 'postal-code' },
];

// Prefix every ID so delivery and billing labels always target the correct input.
export default function AddressFields({ title, prefix, values, errors, onChange, onBlur }) {
  return (
    <fieldset className="address-fields">
      <legend>{title}</legend>
      {fields.map(({ name, label, type = 'text', inputMode, autoComplete }) => {
        const key = `${prefix}.${name}`;
        const errorId = `${prefix}-${name}-error`;
        return (
          <label key={name} htmlFor={`${prefix}-${name}`}>
            {label}
            <input
              id={`${prefix}-${name}`}
              name={key}
              type={type}
              inputMode={inputMode}
              autoComplete={`${prefix === 'billing' ? 'billing' : 'shipping'} ${autoComplete}`}
              value={values[name]}
              aria-invalid={Boolean(errors[key])}
              aria-describedby={errors[key] ? errorId : undefined}
              onChange={(event) => onChange(name, event.target.value)}
              onBlur={() => onBlur(name)}
            />
            {errors[key] ? (
              <span id={errorId} className="form-error" role="alert">
                {errors[key]}
              </span>
            ) : null}
          </label>
        );
      })}
    </fieldset>
  );
}

AddressFields.propTypes = {
  title: PropTypes.string.isRequired,
  prefix: PropTypes.oneOf(['delivery', 'billing', 'account']).isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};
