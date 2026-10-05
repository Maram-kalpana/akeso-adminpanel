export default function ConfirmDeleteModal({ title, onConfirm, onClose }) {
  if (!title) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete record?</h3>
        <p>This will permanently delete <strong>{title}</strong>.</p>
        <div className="actions">
          <button className="btn danger" type="button" onClick={onConfirm}>Delete</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
