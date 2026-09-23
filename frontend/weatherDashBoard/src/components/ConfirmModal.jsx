import { useEffect, useRef, useState, useCallback } from "react";
import "./ConfirmModal.css";

const ANIM_DURATION = 200; // ms — must match CSS animation duration

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  const [closing, setClosing] = useState(false);

  // The modal is rendered when isOpen is true OR we're mid-close animation
  const visible = isOpen || closing;

  // Focus Cancel button when modal opens
  useEffect(() => {
    if (isOpen && !closing && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [isOpen, closing]);

  // Animate out, then fire callback
  const animateClose = useCallback((callback) => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      callback?.();
    }, ANIM_DURATION);
  }, []);

  const handleCancel = useCallback(() => {
    animateClose(onCancel);
  }, [animateClose, onCancel]);

  const handleConfirm = useCallback(() => {
    animateClose(onConfirm);
  }, [animateClose, onConfirm]);

  // Close on Escape key
  useEffect(() => {
    if (!visible || closing) return;

    function handleKey(e) {
      if (e.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, closing, handleCancel]);

  if (!visible) return null;

  const stateClass = closing ? "confirm--closing" : "confirm--open";

  return (
    <div
      className={`confirm-overlay ${stateClass}`}
      onClick={handleCancel}
      role="presentation"
    >
      <div
        className={`confirm-modal ${stateClass}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" className="confirm-modal__title">{title}</h3>
        <p id="confirm-message" className="confirm-modal__message">{message}</p>

        <div className="confirm-modal__actions">
          <button
            ref={cancelRef}
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="confirm-modal__btn confirm-modal__btn--delete"
            onClick={handleConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
