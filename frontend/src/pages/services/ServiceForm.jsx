import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
import { servicesApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl, slugify } from '../../utils';

const empty = { name: '', slug: '', description: '', is_active: true, sort_order: 0 };

export default function ServiceForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setFile(null);
    if (!id) {
      setForm(empty);
      setExisting('');
      return;
    }
    servicesApi.get(id).then((res) => {
      const d = res.data.data;
      setForm({ ...d, is_active: Boolean(d.is_active) });
      setExisting(mediaUrl(d.icon_image));
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name) {
      setError('Name is required');
      return;
    }
    try {
      const payload = toFormData(form, 'icon_image', file);
      if (id) await servicesApi.update(id, payload);
      else await servicesApi.create(payload);
      toast.success(id ? 'Service updated' : 'Service created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit service' : 'Add service'} onClose={onClose}>
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
          <label>Sort order</label>
          <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
        </div>
        <label className="check">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
          Active
        </label>
        <div className="full">
          <label>Description</label>
          <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="full">
          <ImageUpload label="Icon image" existingUrl={existing} onFile={setFile} />
        </div>
        {error ? <div className="error full">{error}</div> : null}
        <div className="actions full">
          <button className="btn" type="submit">Save</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}
