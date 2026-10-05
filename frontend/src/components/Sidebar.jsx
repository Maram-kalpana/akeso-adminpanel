import { NavLink } from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import MiscellaneousServicesOutlinedIcon from '@mui/icons-material/MiscellaneousServicesOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

const links = [
  { to: '/dashboard', label: 'Dashboard', Icon: DashboardOutlinedIcon },
  { to: '/doctors', label: 'Doctors', Icon: MedicalServicesOutlinedIcon },
  { to: '/specialities', label: 'Specialities', Icon: CategoryOutlinedIcon },
  { to: '/services', label: 'Services', Icon: MiscellaneousServicesOutlinedIcon },
  { to: '/hospitals', label: 'Hospitals / Locations', Icon: ApartmentOutlinedIcon },
  { to: '/health-library', label: 'Health Library', Icon: MenuBookOutlinedIcon },
  { to: '/our-stories', label: 'Our Stories', Icon: AutoStoriesOutlinedIcon },
  { to: '/blogs', label: 'Blogs', Icon: ArticleOutlinedIcon },
  { to: '/faqs', label: 'FAQs', Icon: HelpOutlineOutlinedIcon },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        Hospital CMS
        <small>Admin panel</small>
      </div>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <link.Icon className="nav-icon" fontSize="small" />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
