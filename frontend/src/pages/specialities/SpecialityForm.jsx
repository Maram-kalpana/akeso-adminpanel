import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
import RepeatableList from '../../components/RepeatableList';
import { specialitiesApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl, slugify } from '../../utils';

const empty = {
  name: '',
  slug: '',
  about_content: '',
  is_active: true,
  highlights: [''],
  subspecialities: [''],
  ailments: [''],
};

export default function SpecialityForm({ open, id, onClose, onSaved }) {
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
    specialitiesApi.get(id).then((res) => {
      const d = res.data.data;
      setForm({
        ...empty,
        ...d,
        is_active: Boolean(d.is_active),
        highlights: d.highlights?.length ? d.highlights : [''],
        subspecialities: d.subspecialities?.length ? d.subspecialities : [''],
        ailments: d.ailments?.length ? d.ailments : [''],
      });
      setExisting(mediaUrl(d.about_image));
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
      const payload = toFormData({
        name: form.name,
        slug: form.slug || slugify(form.name),
        about_content: form.about_content,
        is_active: form.is_active,
        highlights: form.highlights.filter(Boolean),
        subspecialities: form.subspecialities.filter(Boolean),
        ailments: form.ailments.filter(Boolean),
      }, 'about_image', file);
      if (id) await specialitiesApi.update(id, payload);
      else await specialitiesApi.create(payload);
      toast.success(id ? 'Speciality updated' : 'Speciality created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit speciality' : 'Add speciality'} onClose={onClose} width="720px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Speciality name *</label>
          <input value={form.name} onChange={(e) => {
            set('name', e.target.value);
            if (!id) set('slug', slugify(e.target.value));
          }} />
        </div>
        <div className="full">
          <label>About</label>
          <textarea value={form.about_content || ''} onChange={(e) => set('about_content', e.target.value)} />
        </div>
        <div className="full">
          <ImageUpload label="About image" existingUrl={existing} onFile={setFile} />
        </div>
        <RepeatableList label="Key highlights" values={form.highlights} onChange={(v) => set('highlights', v)} placeholder="Highlight" />
        <RepeatableList label="Sub specialities" values={form.subspecialities} onChange={(v) => set('subspecialities', v)} placeholder="Sub speciality" />
        <RepeatableList label="Ailments" values={form.ailments} onChange={(v) => set('ailments', v)} placeholder="Ailment" />
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
