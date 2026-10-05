import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

export default function RichTextEditor({ label, value, onChange }) {
  return (
    <div className="full">
      <label>{label}</label>
      <ReactQuill theme="snow" value={value || ''} onChange={onChange} modules={modules} />
    </div>
  );
}
