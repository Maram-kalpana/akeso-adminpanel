import { useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { hospitalsApi } from '../../api';
import { usePagedList } from '../../hooks';
import { yesNo } from '../../utils';
import HospitalForm from './HospitalForm';

export default function HospitalList() {
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(hospitalsApi);
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
      await hospitalsApi.remove(deleting.id);
      toast.success('Hospital deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'city', label: 'City' },
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
        <h1>Hospitals / Locations</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>
      <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hospitals..." />
        <button className="btn secondary" type="submit">Search</button>
      </form>
      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.name} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <HospitalForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
