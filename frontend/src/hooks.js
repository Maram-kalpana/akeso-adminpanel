import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function usePagedList(api, extraParams = {}) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 10;

  async function load(nextPage = page, nextSearch = search) {
    setLoading(true);
    try {
      const res = await api.list({ page: nextPage, limit, search: nextSearch, ...extraParams });
      setRows(res.data.rows || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, JSON.stringify(extraParams)]);

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    load(1, search);
  }

  return { rows, total, page, setPage, search, setSearch, loading, reload: () => load(page, search), onSearch, limit };
}
