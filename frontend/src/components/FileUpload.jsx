export default function FileUpload({ label, existingUrl, onFile, accept = 'image/*,.pdf,.doc,.docx' }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      {existingUrl ? (
        <div style={{ marginTop: 8 }}>
          <a href={existingUrl} target="_blank" rel="noreferrer">View current file</a>
        </div>
      ) : null}
    </div>
  );
}
