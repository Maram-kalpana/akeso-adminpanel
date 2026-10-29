import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
 import PatientManagement from './pages/patients/PatientManagement';
 import DoctorList from './pages/doctors/DoctorList';
 import SpecialityList from './pages/specialities/SpecialityList';
 import ServiceList from './pages/services/ServiceList';
import HospitalList from './pages/hospitals/HospitalList';
import HealthLibraryList from './pages/health-library/HealthLibraryList';
 import StoryList from './pages/our-stories/StoryList';
 import BlogList from './pages/blogs/BlogList';
 import FaqList from './pages/faqs/FaqList';
 import Partners from './pages/partners/partners';
 import Settings from './pages/settings/settings';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
       <Route path="/doctors" element={<ProtectedRoute><DoctorList /></ProtectedRoute>} /> 
       <Route path="/specialities" element={<ProtectedRoute><SpecialityList /></ProtectedRoute>} /> 
       <Route path="/services" element={<ProtectedRoute><ServiceList /></ProtectedRoute>} /> 
       <Route path="/hospitals" element={<ProtectedRoute><HospitalList /></ProtectedRoute>} /> 
       <Route path="/patients" element={<ProtectedRoute><PatientManagement /></ProtectedRoute>} /> 
      <Route path="/health-library" element={<ProtectedRoute><HealthLibraryList /></ProtectedRoute>} />
      <Route path="/our-stories" element={<ProtectedRoute><StoryList /></ProtectedRoute>} /> 
       <Route path="/blogs" element={<ProtectedRoute><BlogList /></ProtectedRoute>} /> 
       <Route path="/faqs" element={<ProtectedRoute><FaqList /></ProtectedRoute>} /> 
       <Route path="/testimonials" element={<Navigate to="/faqs" replace />} /> 
     <Route path="/partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />
{/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
<Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}
