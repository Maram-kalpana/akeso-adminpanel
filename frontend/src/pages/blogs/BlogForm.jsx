import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
import { blogsApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl, slugify } from '../../utils';

const empty = {
  title: '',
  slug: '',
  content: '',
};

export default function BlogForm({ open, id, onClose, onSaved }) {
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
    blogsApi.get(id).then((res) => {
      const d = res.data.data;
      setForm({
        title: d.title || '',
        slug: d.slug || '',
        content: d.content || '',
      });
      setExisting(mediaUrl(d.thumbnail));
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title) {
      setError('Blog name is required');
      return;
    }
    try {
      const payload = toFormData({
        title: form.title,
        slug: form.slug || slugify(form.title),
        content: form.content,
        is_published: true,
      }, 'thumbnail', file);
      if (id) await blogsApi.update(id, payload);
      else await blogsApi.create(payload);
      toast.success(id ? 'Blog updated' : 'Blog created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit blog' : 'Add blog'} onClose={onClose} width="720px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Blog name *</label>
          <input value={form.title} onChange={(e) => {
            set('title', e.target.value);
            if (!id) set('slug', slugify(e.target.value));
          }} />
        </div>
        <div className="full">
          <ImageUpload label="Image" existingUrl={existing} onFile={setFile} />
        </div>
        <div className="full">
          <label>Description</label>
          <textarea value={form.content} onChange={(e) => set('content', e.target.value)} />
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
