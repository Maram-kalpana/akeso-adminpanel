
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Drawer from "../../components/Drawer";
import ImageUpload from "../../components/ImageUpload";
import RichTextEditor from "../../components/RichTextEditor";

import { toFormData } from "../../api/client";
import { editorialApi } from "../../api/editorial";
import { specialitiesApi } from "../../api";
import { mediaUrl } from "../../utils";

const emptyForm = {
  title: "",
  speciality_id: "",
  content: "",
  is_published: true,
};

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #DFE7EC",
  borderRadius: 8,
  background: "#FFFFFF",
  color: "#334155",
  fontSize: 13,
  outlineColor: "#13899B",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: 7,
  color: "#475569",
  fontSize: 13,
  fontWeight: 600,
};

export default function BlogForm({
  kind,
  id,
  open,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({ ...emptyForm });
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [specialities, setSpecialities] = useState([]);
  const [saving, setSaving] = useState(false);

  const label = kind === "blogs" ? "Blog" : "Case Study";

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    setForm({ ...emptyForm });
    setFile(null);
    setImage("");

    // Fetch specialities from existing API
    specialitiesApi
      .list({ page: 1, limit: 100 })
      .then((response) => {
        if (cancelled) return;

        const payload = response.data;

        const options =
          payload.rows ||
          payload.data?.rows ||
          payload.data ||
          [];

        setSpecialities(
          Array.isArray(options) ? options : []
        );
      })
      .catch(() => {
        if (!cancelled) {
          setSpecialities([]);
          toast.error("Failed to load specialities");
        }
      });

    // Fetch existing blog/case study for editing
    if (id) {
      editorialApi(kind)
        .get(id)
        .then((response) => {
          if (cancelled) return;

          const data = response.data.data;

          setForm({
            title: data.title || "",
            speciality_id:
              data.speciality_id == null
                ? ""
                : String(data.speciality_id),
            content: data.content || "",
            is_published:
              Number(data.is_published) === 1,
          });

          setImage(
            data.thumbnail
              ? mediaUrl(data.thumbnail)
              : ""
          );
        })
        .catch(() => {
          if (!cancelled) {
            toast.error("Failed to load item");
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [kind, id, open]);

  const setField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    if (!form.title.trim()) {
      toast.error(`${label} name is required`);
      return;
    }

    setSaving(true);

    try {
      const payload = toFormData(
        form,
        "thumbnail",
        file
      );

      const api = editorialApi(kind);

      if (id) {
        await api.update(id, payload);
      } else {
        await api.create(payload);
      }

      toast.success(
        `${label} ${
          id ? "updated" : "added"
        } successfully`
      );

      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`${id ? "Edit" : "Add New"} ${label}`}
      width="520px"
    >
      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* BLOG / CASE STUDY NAME */}
          <div>
            <label style={labelStyle}>
              {label} Name{" "}
              <span style={{ color: "#DC2626" }}>
                *
              </span>
            </label>

            <input
              type="text"
              required
              value={form.title}
              onChange={(e) =>
                setField("title", e.target.value)
              }
              placeholder={`Enter ${label.toLowerCase()} name`}
              style={fieldStyle}
            />
          </div>

          {/* FEATURED IMAGE */}
          <div>
            <label style={labelStyle}>
              Featured Image
            </label>

            <div
              style={{
                border: "1px solid #E1E9EF",
                borderRadius: 9,
                padding: 12,
                background: "#FAFCFD",
              }}
            >
              <ImageUpload
                existingUrl={image}
                onFile={setFile}
              />
            </div>
          </div>

          {/* SPECIALITY */}
          <div>
            <label style={labelStyle}>
              Speciality
            </label>

            <select
              value={form.speciality_id}
              onChange={(e) =>
                setField(
                  "speciality_id",
                  e.target.value
                )
              }
              style={fieldStyle}
            >
              <option value="">
                Select Speciality
              </option>

              {specialities.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* ONLY ONE DESCRIPTION - RICH TEXT EDITOR */}
          <div style={{ minWidth: 0 }}>
            <RichTextEditor
              label="Description"
              value={form.content}
              onChange={(value) =>
                setField("content", value)
              }
            />
          </div>

          {/* PUBLISH */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              border: "1px solid #E1E9EF",
              borderRadius: 9,
              background: "#F8FAFC",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                setField(
                  "is_published",
                  e.target.checked
                )
              }
              style={{
                width: 16,
                height: 16,
                accentColor: "#13899B",
              }}
            />

            <span
              style={{
                color: "#334155",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Publish on website
            </span>
          </label>
        </div>

        {/* FOOTER BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 20px",
            borderTop: "1px solid #E1E9EF",
            background: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 17px",
              border: "1px solid #DFE7EC",
              borderRadius: 8,
              background: "#F1F5F9",
              color: "#475569",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 22px",
              border: "none",
              borderRadius: 8,
              background: "#13899B",
              color: "#FFFFFF",
              fontWeight: 600,
              cursor: saving
                ? "not-allowed"
                : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving
              ? "Saving..."
              : id
                ? "Update"
                : "Save"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}




// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import Drawer from '../../components/Drawer';
// import ImageUpload from '../../components/ImageUpload';
// import { blogsApi } from '../../api';
// import { toFormData } from '../../api/client';
// import { mediaUrl, slugify } from '../../utils';

// const empty = {
//   title: '',
//   slug: '',
//   content: '',
// };

// export default function BlogForm({ open, id, onClose, onSaved }) {
//   const [form, setForm] = useState(empty);
//   const [file, setFile] = useState(null);
//   const [existing, setExisting] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!open) return;
//     setError('');
//     setFile(null);
//     if (!id) {
//       setForm(empty);
//       setExisting('');
//       return;
//     }
//     blogsApi.get(id).then((res) => {
//       const d = res.data.data;
//       setForm({
//         title: d.title || '',
//         slug: d.slug || '',
//         content: d.content || '',
//       });
//       setExisting(mediaUrl(d.thumbnail));
//     });
//   }, [open, id]);

//   function set(key, value) {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   }

//   async function onSubmit(e) {
//     e.preventDefault();
//     if (!form.title) {
//       setError('Blog name is required');
//       return;
//     }
//     try {
//       const payload = toFormData({
//         title: form.title,
//         slug: form.slug || slugify(form.title),
//         content: form.content,
//         is_published: true,
//       }, 'thumbnail', file);
//       if (id) await blogsApi.update(id, payload);
//       else await blogsApi.create(payload);
//       toast.success(id ? 'Blog updated' : 'Blog created');
//       onSaved?.();
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     }
//   }

//   return (
//     <Drawer open={open} title={id ? 'Edit blog' : 'Add blog'} onClose={onClose} width="720px">
//       <form className="drawer-body form-grid" onSubmit={onSubmit}>
//         <div className="full">
//           <label>Blog name *</label>
//           <input value={form.title} onChange={(e) => {
//             set('title', e.target.value);
//             if (!id) set('slug', slugify(e.target.value));
//           }} />
//         </div>
//         <div className="full">
//           <ImageUpload label="Image" existingUrl={existing} onFile={setFile} />
//         </div>
//         <div className="full">
//           <label>Description</label>
//           <textarea value={form.content} onChange={(e) => set('content', e.target.value)} />
//         </div>
//         {error ? <div className="error full">{error}</div> : null}
//         <div className="actions full">
//           <button className="btn" type="submit">Save</button>
//           <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
//         </div>
//       </form>
//     </Drawer>
//   );
// }
