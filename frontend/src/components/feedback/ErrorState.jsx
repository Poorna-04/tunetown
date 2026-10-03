import PropTypes from 'prop-types';

export default function ErrorState({ message, onRetry }) {
  return (
    <section className="error-panel" role="alert">
      <h2>We could not load this section</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </section>
  );
}

ErrorState.propTypes = { message: PropTypes.string.isRequired, onRetry: PropTypes.func.isRequired };
