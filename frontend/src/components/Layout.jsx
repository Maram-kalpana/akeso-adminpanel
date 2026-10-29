
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">

      {menuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeMenu}
        />
      )}

      <Sidebar
        menuOpen={menuOpen}
        closeMenu={closeMenu}
      />

      <div className="main">
        <Topbar
          menuOpen={menuOpen}
          toggleMenu={() => setMenuOpen(prev => !prev)}
        />

        <div className="content">
          {children}
        </div>
      </div>

    </div>
  );
}



// import Sidebar from './Sidebar';
// import Topbar from './Topbar';

// export default function Layout({ children }) {
//   return (
//     <div className="app-shell">
//       <Sidebar />
//       <div className="main">
//         <Topbar />
//         <div className="content">{children}</div>
//       </div>
//     </div>
//   );
// }
