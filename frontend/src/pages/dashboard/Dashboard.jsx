import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api';
import toast from 'react-hot-toast';

const cards = [
  ['doctors', 'Doctors'],
  ['specialities', 'Specialities'],
  ['services', 'Services'],
  ['hospitals', 'Hospitals'],
  ['health_library', 'Health Library'],
  ['our_stories', 'Our Stories'],
  ['blogs', 'Blogs'],
  ['faqs', 'FAQs'],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load stats'));
  }, []);

  return (
    <div>
      <div className="page-head">
        <h1>Dashboard</h1>
      </div>
      <div className="stats">
        {cards.map(([key, label]) => (
          <div className="stat" key={key}>
            <span>{label}</span>
            <b>{stats ? stats[key] : '—'}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
