import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { admin, logout } = useAuth();
  return (
    <header className="topbar">
      <strong>Content management</strong>
      <div className="actions">
        <span>{admin?.name} ({admin?.role})</span>
        <button className="btn secondary small" onClick={logout} type="button">Logout</button>
      </div>
    </header>
  );
}
