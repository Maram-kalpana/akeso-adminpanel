import { useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { blogsApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip, mediaUrl } from '../../utils';
import BlogForm from './BlogForm';

export default function BlogList() {
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(blogsApi);
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
      await blogsApi.remove(deleting.id);
      toast.success('Blog deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'thumbnail', label: 'Image', render: (r) => r.thumbnail ? <img className="thumb" src={mediaUrl(r.thumbnail)} alt="" /> : '—' },
    { key: 'title', label: 'Blog name' },
    { key: 'content', label: 'Description', render: (r) => <span className="cell-clip">{clip(r.content)}</span> },
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
        <h1>Blogs</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>
      <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs..." />
        <button className="btn secondary" type="submit">Search</button>
      </form>
      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.title} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <BlogForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
