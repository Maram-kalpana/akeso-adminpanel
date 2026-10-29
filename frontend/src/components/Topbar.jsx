
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Topbar({ menuOpen, toggleMenu }) {
  const { admin, logout } = useAuth();

  return (
    <header className="topbar">

      <div className="topbar-left">

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={Boolean(menuOpen)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <strong className="topbar-title">
          Content management
        </strong>

      </div>

      <div className="actions">
        <span className="admin-info">
          {admin?.name} ({admin?.role})
        </span>

        <button
          className="btn secondary small"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>

    </header>
  );
}



// import { useAuth } from '../context/AuthContext';

// export default function Topbar() {
//   const { admin, logout } = useAuth();
//   return (
//     <header className="topbar">
//       <strong>Content management</strong>
//       <div className="actions">
//         <span>{admin?.name} ({admin?.role})</span>
//         <button className="btn secondary small" onClick={logout} type="button">Logout</button>
//       </div>
//     </header>
//   );
// }
