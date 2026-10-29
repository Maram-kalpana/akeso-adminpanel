import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageUpload from '../../components/ImageUpload';
import { settingsApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl } from '../../utils';

const empty = {
  email: '',
  phone: '',
  alt_phone: '',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: '',
  address: '',
  terms_conditions: '',
  privacy_policy: '',
};

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const cleanHtml = (html) => (!html || html === '<p><br></p>' ? '' : html);

export default function Settings() {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    return settingsApi
      .get()
      .then((res) => {
        const d = res.data.data || {};
        setForm({
          email: d.email || '',
          phone: d.phone || '',
          alt_phone: d.alt_phone || '',
          facebook_url: d.facebook_url || '',
          instagram_url: d.instagram_url || '',
          linkedin_url: d.linkedin_url || '',
          youtube_url: d.youtube_url || '',
          address: d.address || '',
          terms_conditions: d.terms_conditions || '',
          privacy_policy: d.privacy_policy || '',
        });
        setExisting(d.logo ? mediaUrl(d.logo) : '');
        setFile(null);
      })
      .catch(() => toast.error('Could not load settings'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = toFormData(
        {
          ...form,
          terms_conditions: cleanHtml(form.terms_conditions),
          privacy_policy: cleanHtml(form.privacy_policy),
        },
        'logo',
        file
      );
      await settingsApi.update(payload);
      toast.success('Settings saved');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div className="page-head">
        <h1>Settings</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="card settings-section">
          <h2>Website logo</h2>
          <div className="form-grid">
            <div className="full">
              <ImageUpload label="Logo" existingUrl={existing} onFile={setFile} />
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <h2>Contact details</h2>
          <div className="form-grid">
            <div>
              <label>Email ID</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label>Contact number</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label>Alternate contact number</label>
              <input value={form.alt_phone} onChange={(e) => set('alt_phone', e.target.value)} />
            </div>
            <div className="full">
              <label>Address</label>
              <textarea value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <h2>Social media links</h2>
          <div className="form-grid">
            <div>
              <label>Facebook</label>
              <input type="url" placeholder="https://facebook.com/..." value={form.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} />
            </div>
            <div>
              <label>Instagram</label>
              <input type="url" placeholder="https://instagram.com/..." value={form.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} />
            </div>
            <div>
              <label>LinkedIn</label>
              <input type="url" placeholder="https://linkedin.com/..." value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} />
            </div>
            <div>
              <label>YouTube</label>
              <input type="url" placeholder="https://youtube.com/..." value={form.youtube_url} onChange={(e) => set('youtube_url', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <h2>Terms and conditions</h2>
          <ReactQuill
            theme="snow"
            value={form.terms_conditions}
            onChange={(v) => set('terms_conditions', v)}
            modules={quillModules}
            placeholder="Write the terms and conditions"
          />
        </div>

        <div className="card settings-section">
          <h2>Privacy policy</h2>
          <ReactQuill
            theme="snow"
            value={form.privacy_policy}
            onChange={(v) => set('privacy_policy', v)}
            modules={quillModules}
            placeholder="Write the privacy policy"
          />
        </div>

        {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}