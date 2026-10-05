import { useEffect, useState } from 'react';

export default function ImageUpload({ label, existingUrl, onFile }) {
  const [preview, setPreview] = useState(existingUrl || '');

  useEffect(() => {
    setPreview(existingUrl || '');
  }, [existingUrl]);

  return (
    <div>
      <label>{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          onFile(file || null);
          if (file) setPreview(URL.createObjectURL(file));
        }}
      />
      {preview ? <div style={{ marginTop: 8 }}><img className="preview" src={preview} alt="Preview" /></div> : null}
    </div>
  );
}
