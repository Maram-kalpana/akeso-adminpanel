import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import { faqsApi } from '../../api';

const empty = { question: '', answer: '' };

export default function FaqForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (!id) {
      setForm(empty);
      return;
    }
    faqsApi.get(id).then((res) => {
      const d = res.data.data;
      setForm({ question: d.question || '', answer: d.answer || '' });
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.question || !form.answer) {
      setError('Question and answer are required');
      return;
    }
    try {
      if (id) await faqsApi.update(id, form);
      else await faqsApi.create(form);
      toast.success(id ? 'FAQ updated' : 'FAQ created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit FAQ' : 'Add FAQ'} onClose={onClose}>
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Question *</label>
          <input value={form.question} onChange={(e) => set('question', e.target.value)} />
        </div>
        <div className="full">
          <label>Answer *</label>
          <textarea value={form.answer} onChange={(e) => set('answer', e.target.value)} />
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
