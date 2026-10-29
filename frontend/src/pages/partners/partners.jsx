import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { partnersApi } from '../../api';
import { mediaUrl } from '../../utils';
import PartnerForm from './PartnerForm';

const PAGE_SIZE = 10;

export default function Partners() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    partnersApi
      .list()
      .then((res) => {
        const data = res.data.data;
        setItems(Array.isArray(data) ? data : data?.items || []);
      })
      .catch(() => toast.error('Could not load partners'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => (i.name || '').toLowerCase().includes(q)) : items;
  }, [items, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function onSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function openAdd() {
    setEditId(null);
    setDrawerOpen(true);
  }

  function openEdit(id) {
    setEditId(id);
    setDrawerOpen(true);
  }

  async function onDelete(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await partnersApi.remove(item.id);
      toast.success('Partner deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div>
      <div className="page-head">
        <h1>Partners</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>

      <form className="toolbar" onSubmit={onSearch}>
        <input
          placeholder="Search partners..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button className="btn secondary" type="submit">Search</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="3">No partners found.</td></tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img className="partner-thumb" src={mediaUrl(item.logo)} alt={item.name} />
                  </td>
                  <td>{item.name}</td>
                  <td>
                    <div className="actions">
                      <button className="btn secondary small" type="button" onClick={() => openEdit(item.id)}>Edit</button>
                      <button className="btn danger small" type="button" onClick={() => onDelete(item)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Showing page {current} of {pages} ({filtered.length} records)</span>
        <div className="pager">
          <button className="btn secondary small" type="button" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</button>
          <button className="btn secondary small" type="button" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</button>
        </div>
      </div>

      <PartnerForm
        open={drawerOpen}
        id={editId}
        onClose={() => setDrawerOpen(false)}
        onSaved={load}
      />
    </div>
  );
}