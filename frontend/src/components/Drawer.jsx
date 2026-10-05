import { useEffect } from 'react';

export default function Drawer({ open, title, onClose, width = '480px', children }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`drawer-overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside
        className={`drawer ${open ? 'open' : ''}`}
        style={{ width }}
        aria-hidden={!open}
      >
        <div className="drawer-head">
          <h2>{title}</h2>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </aside>
    </>
  );
}
