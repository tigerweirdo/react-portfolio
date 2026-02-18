import React, { useEffect, useCallback } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './ConfirmDialog.scss';

const ConfirmDialog = ({
  isOpen,
  title = 'Emin misiniz?',
  message = 'Bu işlem geri alınamaz.',
  confirmLabel = 'Onayla',
  cancelLabel = 'İptal',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !isLoading) {
      onCancel();
    }
  }, [onCancel, isLoading]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={isLoading ? undefined : onCancel}>
      <div className={`confirm-dialog ${variant}`} onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close" onClick={onCancel} disabled={isLoading} aria-label="Kapat">
          <FaTimes />
        </button>

        <div className="confirm-icon-wrapper">
          <FaExclamationTriangle className="confirm-icon" />
        </div>

        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="confirm-cancel-btn" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button className={`confirm-ok-btn ${variant}`} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'İşleniyor...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
