import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { doctorsApi, specialitiesApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip, mediaUrl, yesNo } from '../../utils';
import DoctorDrawer from './DoctorForm';

export default function DoctorList() {
  const [specialityId, setSpecialityId] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(doctorsApi, {
    speciality_id: specialityId || undefined,
  });
  const [deleting, setDeleting] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, id: null });

  function openAdd() {
    setDrawer({ open: true, id: null });
  }
  function openEdit(id) {
    setDrawer({ open: true, id });
  }
  function closeDrawer() {
    setDrawer({ open: false, id: null });
  }

  useEffect(() => {
    specialitiesApi.options().then((res) => setSpecialities(res.data.rows || [])).catch(() => {});
  }, []);

  async function confirmDelete() {
    try {
      await doctorsApi.remove(deleting.id);
      toast.success('Doctor deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'photo', label: 'Photo', render: (r) => r.photo ? <img className="thumb" src={mediaUrl(r.photo)} alt="" /> : '—' },
    { key: 'name', label: 'Name' },
    { key: 'license_number', label: 'License' },
    { key: 'speciality_name', label: 'Speciality' },
    { key: 'experience_years', label: 'Experience' },
    { key: 'hospital_location', label: 'Hospital / location' },
    { key: 'qualifications_text', label: 'Qualifications', render: (r) => <span className="cell-clip">{clip(r.qualifications_text, 60)}</span> },
    { key: 'is_active', label: 'Active', render: (r) => <span className={`badge ${r.is_active ? '' : 'off'}`}>{yesNo(r.is_active)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="actions">
          <button className="btn secondary small" type="button" onClick={() => openEdit(r.id)}>Edit</button>
          <button className="btn danger small" type="button" onClick={() => setDeleting(r)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-head">
        <h1>Doctors</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>
      <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors..." />
        <select value={specialityId} onChange={(e) => { setSpecialityId(e.target.value); setPage(1); }}>
          <option value="">All specialities</option>
          {specialities.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="btn secondary" type="submit">Search</button>
      </form>
      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.name} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <DoctorDrawer open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
