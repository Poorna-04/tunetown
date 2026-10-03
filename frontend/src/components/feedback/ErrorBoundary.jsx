import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * React still requires a class for error boundaries. This component prevents
 * an unexpected rendering error from replacing the whole page with a blank screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-panel" aria-labelledby="unexpected-error-title">
          <h1 id="unexpected-error-title">Something went wrong</h1>
          <p>This part of TuneTown could not be displayed.</p>
          <button type="button" onClick={this.handleRetry}>
            Try again
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
