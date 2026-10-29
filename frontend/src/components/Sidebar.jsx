
import { NavLink } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
const links = [
  { to: "/dashboard", label: "Dashboard", Icon: DashboardOutlinedIcon },
  { to: "/patients", label: "Patients", Icon: GroupOutlinedIcon },
  { to: "/doctors", label: "Doctors", Icon: MedicalServicesOutlinedIcon },
  { to: "/specialities", label: "Specialities", Icon: CategoryOutlinedIcon },
  { to: "/partners", label: "Partners", Icon: HandshakeOutlinedIcon },
  // { to: "/services", label: "Services", Icon: MiscellaneousServicesOutlinedIcon },
  // { to: "/hospitals", label: "Hospitals / Locations", Icon: ApartmentOutlinedIcon },
  { to: "/health-library", label: "Health Library", Icon: MenuBookOutlinedIcon },
   { to: "/our-stories", label: "Our Stories", Icon: AutoStoriesOutlinedIcon },
  { to: "/blogs", label: "Blogs", Icon: ArticleOutlinedIcon },
  { to: "/faqs", label: "FAQs", Icon: HelpOutlineOutlinedIcon },
   { to: "/settings", label: "Settings", Icon: SettingsOutlinedIcon },
];

export default function Sidebar({
  menuOpen = false,
  closeMenu = () => {},
}) {
  return (
    <aside
      className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
      aria-label="Admin navigation"
    >
      <div className="brand sidebar-brand">
        <div>
          Hospital CMS
          <small>Admin panel</small>
        </div>

        <button
          type="button"
          className="sidebar-close-btn"
          onClick={closeMenu}
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>

      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeMenu}
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
          >
            <link.Icon className="nav-icon" fontSize="small" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
