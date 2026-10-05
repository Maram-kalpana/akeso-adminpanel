import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import { hospitalsApi } from '../../api';
import { slugify } from '../../utils';

const empty = { name: '', slug: '', city: '', address: '', phone: '', is_active: true };

export default function HospitalForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (!id) {
      setForm(empty);
      return;
    }
    hospitalsApi.get(id).then((res) => {
      const d = res.data.data;
      setForm({ ...d, is_active: Boolean(d.is_active) });
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.city) {
      setError('Name and city are required');
      return;
    }
    try {
      if (id) await hospitalsApi.update(id, form);
      else await hospitalsApi.create(form);
      toast.success(id ? 'Hospital updated' : 'Hospital created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit hospital' : 'Add hospital'} onClose={onClose} width="720px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div>
          <label>Name *</label>
          <input value={form.name} onChange={(e) => {
            set('name', e.target.value);
            if (!id) set('slug', slugify(e.target.value));
          }} />
        </div>
        <div>
          <label>Slug</label>
          <input value={form.slug} onChange={(e) => set('slug', e.target.value)} />
        </div>
        <div>
          <label>City *</label>
          <input value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div>
          <label>Phone</label>
          <input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div className="full">
          <label>Address</label>
          <textarea value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
        </div>
        <label className="check">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
          Active
        </label>
        {error ? <div className="error full">{error}</div> : null}
        <div className="actions full">
          <button className="btn" type="submit">Save</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}
