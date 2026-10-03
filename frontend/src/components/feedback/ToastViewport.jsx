import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { removeToast } from '../../features/ui/uiSlice';

function Toast({ toast }) {
  const dispatch = useDispatch();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setTimeout(() => dispatch(removeToast(toast.id)), 3000);
    return () => window.clearTimeout(timer);
  }, [dispatch, paused, toast.id]);

  return (
    <div
      className={`toast toast--${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dispatch(removeToast(toast.id))}
      >
        ×
      </button>
    </div>
  );
}

Toast.propTypes = { toast: PropTypes.object.isRequired };

export default function ToastViewport() {
  const toasts = useSelector((state) => state.ui.toasts);
  return createPortal(
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  );
}
