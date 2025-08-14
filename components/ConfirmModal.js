import React, { useEffect, useRef } from 'react';

/**
 * Lightweight, accessible confirm modal (no libraries).
 * - Blocks background with a translucent backdrop
 * - Click backdrop or press Esc to cancel
 * - Focuses the Confirm button by default
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'Please confirm this action.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      try { confirmRef.current?.focus(); } catch {}
    }, 10);
    function onKey(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="cp-modal-title">
      <div className="cp-backdrop" onClick={onCancel} />
      <div className="cp-panel">
        <h2 id="cp-modal-title" className="cp-title">{title}</h2>
        <p className="cp-message">{message}</p>
        <div className="cp-actions">
          <button type="button" className="cp-btn cp-btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            onClick={onConfirm}
            ref={confirmRef}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .cp-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cp-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(1px);
        }
        .cp-panel {
          position: relative;
          z-index: 1;
          width: 92%;
          max-width: 480px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          padding: 20px;
        }
        .cp-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }
        .cp-message {
          margin: 0 0 16px 0;
          color: #334155;
          line-height: 1.6;
        }
        .cp-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .cp-btn {
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .cp-btn-primary {
          background: linear-gradient(135deg, #0068ff, #2ea3f2);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 104, 255, 0.25);
        }
        .cp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 104, 255, 0.35); }
        .cp-btn-secondary { background: #f1f5f9; color: #0f172a; }
        .cp-btn-secondary:hover { background: #e2e8f0; }
      `}</style>
    </div>
  );
}