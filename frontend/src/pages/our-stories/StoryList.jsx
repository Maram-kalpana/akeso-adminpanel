import { useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { storiesApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip } from '../../utils';
import StoryForm from './StoryForm';

export default function StoryList() {
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(storiesApi);
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
      await storiesApi.remove(deleting.id);
      toast.success('Story deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'patient_name', label: 'Name' },
    { key: 'speciality_name', label: 'Speciality' },
    {
      key: 'video_url',
      label: 'Video',
      render: (r) => r.video_url
        ? <a href={r.video_url} target="_blank" rel="noreferrer">{clip(r.video_url, 40)}</a>
        : '—',
    },
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
        <h1>Our Stories</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>
      <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stories..." />
        <button className="btn secondary" type="submit">Search</button>
      </form>
      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.patient_name} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <StoryForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
