import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import FileUpload from '../../components/FileUpload';
import { healthLibraryApi } from '../../api';
import { toFormData } from '../../api/client';
import { dateInput, mediaUrl } from '../../utils';

const empty = {
  patient_name: '',
  phone: '',
  email: '',
  country: '',
  disease: '',
  treatment_start_date: '',
  treatment_end_date: '',
  amount: '',
  hospital_name: '',
  post_op_details: '',
};

export default function HealthLibraryForm({ open, id, onClose, onSaved }) {
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
    healthLibraryApi.get(id).then((res) => {
      const d = res.data.data;
      setForm({
        ...empty,
        ...d,
        patient_name: d.patient_name || d.title || '',
        treatment_start_date: dateInput(d.treatment_start_date),
        treatment_end_date: dateInput(d.treatment_end_date),
        amount: d.amount ?? '',
      });
      setExisting(mediaUrl(d.previous_reports));
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.patient_name) {
      setError('Patient name is required');
      return;
    }
    try {
      const payload = toFormData(form, 'previous_reports', file);
      if (id) await healthLibraryApi.update(id, payload);
      else await healthLibraryApi.create(payload);
      toast.success(id ? 'Patient record updated' : 'Patient record created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit patient record' : 'Add patient record'} onClose={onClose} width="720px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div>
          <label>Name *</label>
          <input value={form.patient_name} onChange={(e) => set('patient_name', e.target.value)} />
        </div>
        <div>
          <label>Phone number</label>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label>Email id</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label>Country</label>
          <input value={form.country} onChange={(e) => set('country', e.target.value)} />
        </div>
        <div>
          <label>Disease</label>
          <input value={form.disease} onChange={(e) => set('disease', e.target.value)} />
        </div>
        <div>
          <label>Hospital name</label>
          <input value={form.hospital_name} onChange={(e) => set('hospital_name', e.target.value)} />
        </div>
        <div>
          <label>Treatment starting date</label>
          <input type="date" value={form.treatment_start_date} onChange={(e) => set('treatment_start_date', e.target.value)} />
        </div>
        <div>
          <label>Treatment ending date</label>
          <input type="date" value={form.treatment_end_date} onChange={(e) => set('treatment_end_date', e.target.value)} />
        </div>
        <div>
          <label>Amount</label>
          <input type="number" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
        </div>
        <div className="full">
          <FileUpload label="Previous reports" existingUrl={existing} onFile={setFile} />
        </div>
        <div className="full">
          <label>Post op details</label>
          <textarea value={form.post_op_details || ''} onChange={(e) => set('post_op_details', e.target.value)} />
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
