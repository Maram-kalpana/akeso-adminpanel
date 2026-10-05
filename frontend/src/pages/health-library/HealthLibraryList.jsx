import { useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { healthLibraryApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip, dateInput, mediaUrl } from '../../utils';
import HealthLibraryForm from './HealthLibraryForm';

export default function HealthLibraryList() {
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(healthLibraryApi);
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

  async function confirmDelete() {
    try {
      await healthLibraryApi.remove(deleting.id);
      toast.success('Record deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'patient_name', label: 'Name', render: (r) => r.patient_name || r.title },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'country', label: 'Country' },
    { key: 'disease', label: 'Disease' },
    { key: 'hospital_name', label: 'Hospital' },
    { key: 'treatment_start_date', label: 'Start date', render: (r) => dateInput(r.treatment_start_date) || '—' },
    { key: 'treatment_end_date', label: 'End date', render: (r) => dateInput(r.treatment_end_date) || '—' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'previous_reports',
      label: 'Reports',
      render: (r) => r.previous_reports ? <a href={mediaUrl(r.previous_reports)} target="_blank" rel="noreferrer">View</a> : '—',
    },
    { key: 'post_op_details', label: 'Post op', render: (r) => <span className="cell-clip">{clip(r.post_op_details, 40)}</span> },
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
        <h1>Health Library</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>
      <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients..." />
        <button className="btn secondary" type="submit">Search</button>
      </form>
      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.patient_name || deleting?.title} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <HealthLibraryForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
