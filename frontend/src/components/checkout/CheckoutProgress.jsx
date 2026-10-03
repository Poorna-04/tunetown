import PropTypes from 'prop-types';

const steps = [
  { id: 'address', label: 'Address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

export default function CheckoutProgress({ current, completed, onStep }) {
  return (
    <nav className="checkout-progress" aria-label="Checkout progress">
      <ol>
        {steps.map((step, index) => {
          const available =
            step.id === 'address' ||
            (step.id === 'payment' && completed.address) ||
            (step.id === 'review' && completed.payment);
          return (
            <li key={step.id} className={step.id === current ? 'checkout-step--current' : ''}>
              <button
                type="button"
                disabled={!available}
                aria-current={step.id === current ? 'step' : undefined}
                onClick={() => onStep(step.id)}
              >
                <span>{index + 1}</span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

CheckoutProgress.propTypes = {
  current: PropTypes.string.isRequired,
  completed: PropTypes.object.isRequired,
  onStep: PropTypes.func.isRequired,
};
