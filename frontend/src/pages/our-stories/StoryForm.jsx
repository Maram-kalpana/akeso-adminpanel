import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import { specialitiesApi, storiesApi } from '../../api';
import { toFormData } from '../../api/client';

const empty = {
  patient_name: '',
  speciality_id: '',
  video_url: '',
};

export default function StoryForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [specialities, setSpecialities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    specialitiesApi.options().then((res) => setSpecialities(res.data.rows || []));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (!id) {
      setForm(empty);
      return;
    }
    storiesApi.get(id).then((res) => {
      const d = res.data.data;
      setForm({
        patient_name: d.patient_name || '',
        speciality_id: d.speciality_id || '',
        video_url: d.video_url || '',
      });
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.patient_name) {
      setError('Name is required');
      return;
    }
    try {
      const payload = toFormData(form);
      if (id) await storiesApi.update(id, payload);
      else await storiesApi.create(payload);
      toast.success(id ? 'Story updated' : 'Story created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit story' : 'Add story'} onClose={onClose}>
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div>
          <label>Name *</label>
          <input value={form.patient_name} onChange={(e) => set('patient_name', e.target.value)} />
        </div>
        <div>
          <label>Speciality</label>
          <select value={form.speciality_id} onChange={(e) => set('speciality_id', e.target.value)}>
            <option value="">None</option>
            {specialities.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="full">
          <label>Video URL</label>
          <input value={form.video_url} onChange={(e) => set('video_url', e.target.value)} placeholder="https://..." />
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
