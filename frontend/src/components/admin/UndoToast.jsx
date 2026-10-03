import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

export default function UndoToast({ count, onUndo }) {
  return createPortal(
    <div className="toast-viewport">
      <div className="toast" role="status">
        <span>
          {count} product{count === 1 ? '' : 's'} will be deleted in 5 seconds.
        </span>
        <button type="button" onClick={onUndo}>
          Undo
        </button>
      </div>
    </div>,
    document.body,
  );
}

UndoToast.propTypes = { count: PropTypes.number.isRequired, onUndo: PropTypes.func.isRequired };
