import { useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { faqsApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip } from '../../utils';
import FaqForm from './FaqForm';

export default function FaqList() {
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(faqsApi);
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
      await faqsApi.remove(deleting.id);
      toast.success('FAQ deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'question', label: 'Question', render: (r) => <span className="cell-clip">{clip(r.question, 80)}</span> },
    { key: 'answer', label: 'Answer', render: (r) => <span className="cell-clip">{clip(r.answer, 80)}</span> },
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
        <h1>FAQs</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>
      <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs..." />
        <button className="btn secondary" type="submit">Search</button>
      </form>
      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.question} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <FaqForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
