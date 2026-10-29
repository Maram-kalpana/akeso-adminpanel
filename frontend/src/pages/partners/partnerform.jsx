import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
import { partnersApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl } from '../../utils';

export default function PartnerForm({ open, id, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setFile(null);
    if (!id) {
      setName('');
      setExisting('');
      return;
    }
    partnersApi.get(id).then((res) => {
      const d = res.data.data;
      setName(d.name || '');
      setExisting(mediaUrl(d.logo));
    });
  }, [open, id]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Partner name is required');
      return;
    }
    if (!id && !file) {
      setError('Please upload a logo');
      return;
    }
    setError('');
    try {
      const payload = toFormData({ name: name.trim() }, 'logo', file);
      if (id) await partnersApi.update(id, payload);
      else await partnersApi.create(payload);
      toast.success(id ? 'Partner updated' : 'Partner added');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit partner' : 'Add partner'} onClose={onClose} width="480px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Partner name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="full">
          <ImageUpload label="Logo *" existingUrl={existing} onFile={setFile} />
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