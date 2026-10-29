import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Drawer from "../../components/Drawer";
import { healthLibraryApi } from "../../api";
import api from "../../api/client";
const empty = {
  patient_name: "",
  phone: "",
  email: "",
  country: "",
  disease: "",
  hospital_name: "",
  subject: "",
  message: "",
  preferred_time: "",
  treatment_start_date: "",
  treatment_end_date: "",
  amount: "",
  post_op_details: "",
};
const names = {
  estimate: "Request an Estimate",
  contact: "Contact Form",
  callback: "Request a Call",
};
const fields = {
  estimate: [
    ["patient_name", "Name"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["country", "Country"],
    ["disease", "Disease / Speciality"],
    ["hospital_name", "Hospital"],
    ["treatment_start_date", "Start Date"],
    ["treatment_end_date", "End Date"],
    ["amount", "Amount"],
    ["message", "Message"],
  ],
  contact: [
    ["patient_name", "Name"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["subject", "Subject"],
    ["message", "Message"],
  ],
  callback: [
    ["patient_name", "Name"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["preferred_time", "Preferred Time"],
    ["message", "Message"],
  ],
};
const parse = (x) => {
  try {
    const v = typeof x === "string" ? JSON.parse(x || "[]") : x || [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
export default function HealthLibraryForm({
  open,
  id,
  type = "estimate",
  view = false,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(empty);

  const [reports, setReports] = useState([]);
const [files, setFiles] = useState([]);
const [busy, setBusy] = useState(false);
  
  useEffect(() => {
    if (!open) return;
    setForm(empty);
    setReports([]);
    setFiles([]);
    
    if (id)
      healthLibraryApi
        .get(id)
        .then(({ data }) => {
          const row = data.data;
          setForm({
            ...empty,
            ...row,
            treatment_start_date: row.treatment_start_date?.slice(0, 10) || "",
            treatment_end_date: row.treatment_end_date?.slice(0, 10) || "",
          });
          setReports(parse(row.previous_reports));
        })
        .catch(() => toast.error("Unable to load record"));
  // }, [open, id]);
  }, [open, id, type]);
  async function submit(e) {
    e.preventDefault();
    if (view) return;
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && typeof v !== "object")
          fd.append(k, v);
      });
      fd.append("type", type);
      files.forEach((f) => fd.append("reports[]", f));
      if (id) await healthLibraryApi.update(id, fd);
      else await healthLibraryApi.create(fd);
      toast.success(id ? "Record updated" : "Record added");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }
  async function download(index, name) {
    try {
      const response = await api.get(`/health-library/${id}/reports/${index}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = name || "report";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Download failed");
    }
  }
  return (
    <Drawer
      open={open}
      title={`${view ? "View" : id ? "Edit" : "Add"} ${names[type]}`}
      onClose={onClose}
      width="720px"
    >
      <form className="drawer-body form-grid" onSubmit={submit}>
        {fields[type].map(([key, label]) => (
          <div key={key}>
            <label>
              {label}
              {["patient_name", "phone"].includes(key) ? " *" : ""}
            </label>
            {key === "message" ? (
              <textarea
                rows={4}
                disabled={view}
                value={form[key] || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
              />
            ) : (
              <input
                disabled={view}
                required={["patient_name", "phone"].includes(key)}
                type={
                  key === "email"
                    ? "email"
                    : key.includes("date")
                      ? "date"
                      : key === "amount"
                        ? "number"
                        : "text"
                }
                value={form[key] || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
              />
            )}
          </div>
        ))}
        
{type === "estimate" && (
  <div style={{ gridColumn: "1 / -1" }}>
    <label>Medical Reports</label>

    {!view && (
      <>
        <input
          type="file"
          name="reports[]"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          multiple
          onChange={(e) => {
            const newFiles = Array.from(
              e.target.files || []
            );

            setFiles((previous) => {
              const combined = [...previous];

              newFiles.forEach((file) => {
                const exists = combined.some(
                  (f) =>
                    f.name === file.name &&
                    f.size === file.size &&
                    f.lastModified === file.lastModified
                );

                if (!exists) {
                  combined.push(file);
                }
              });

              if (combined.length > 20) {
                toast.error(
                  "Maximum 20 medical reports allowed."
                );
                return previous;
              }

              return combined;
            });

            // Allow selecting more files again
            e.target.value = "";
          }}
          style={{
            width: "100%",
            marginTop: 8,
          }}
        />

        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            marginTop: 6,
          }}
        >
          You can select multiple files or add more
          files one by one. PDF, images and Word
          documents are supported.
        </p>
      </>
    )}

    {/* NEWLY SELECTED FILES */}
    {files.length > 0 && !view && (
      <div style={{ marginTop: 14 }}>
        <strong>
          Selected Medical Reports ({files.length})
        </strong>

        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "9px 12px",
              marginTop: 7,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                fontSize: 13,
                overflowWrap: "anywhere",
              }}
            >
              {index + 1}. {file.name}
            </span>

            <button
              type="button"
              className="btn secondary small"
              onClick={() =>
                setFiles((previous) =>
                  previous.filter((_, i) => i !== index)
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )}

    {/* ALREADY SAVED REPORTS */}
    {reports.length > 0 && (
      <div style={{ marginTop: 16 }}>
        <strong>
          Uploaded Medical Reports ({reports.length})
        </strong>

        {reports.map((report, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "9px 12px",
              marginTop: 7,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                fontSize: 13,
                overflowWrap: "anywhere",
              }}
            >
              {index + 1}. {report.name}
            </span>

            <button
              type="button"
              className="btn secondary small"
              onClick={() =>
                download(index, report.name)
              }
            >
              Download
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* {type === "estimate" && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Medical reports</label>
            {!view && (
              <input
                type="file"
                name="reports[]"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                multiple
               onChange={(e) => {
                  const chosenFiles = Array.from(e.target.files || []);
                  setFiles(chosenFiles);
                  setSelectedFiles(chosenFiles);
                }}
              />
            )}
            {selectedFiles.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {selectedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} style={{ fontSize: 13, marginBottom: 5 }}>
                  {index + 1}. {file.name}
                </div>
              ))}
  </div>
)}
            <div>
              {reports.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn secondary small"
                  onClick={() => download(i, r.name)}
                >
                  {r.name || `Report ${i + 1}`} — Download
                </button>
              ))}
            </div>
          </div>
        )} */}
        <div
          className="drawer-actions"
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "end",
            gap: 10,
          }}
        >
          <button type="button" className="btn secondary" onClick={onClose}>
            {view ? "Close" : "Cancel"}
          </button>
          {!view && (
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Saving..." : id ? "Update" : "Save"}
            </button>
          )}
        </div>
      </form>
    </Drawer>
  );
}









// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import Drawer from '../../components/Drawer';
// import FileUpload from '../../components/FileUpload';
// import { healthLibraryApi } from '../../api';
// import { toFormData } from '../../api/client';
// import { dateInput, mediaUrl } from '../../utils';

// const empty = {
//   patient_name: '',
//   phone: '',
//   email: '',
//   country: '',
//   disease: '',
//   treatment_start_date: '',
//   treatment_end_date: '',
//   amount: '',
//   hospital_name: '',
//   post_op_details: '',
// };

// export default function HealthLibraryForm({ open, id, onClose, onSaved }) {
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
//     healthLibraryApi.get(id).then((res) => {
//       const d = res.data.data;
//       setForm({
//         ...empty,
//         ...d,
//         patient_name: d.patient_name || d.title || '',
//         treatment_start_date: dateInput(d.treatment_start_date),
//         treatment_end_date: dateInput(d.treatment_end_date),
//         amount: d.amount ?? '',
//       });
//       setExisting(mediaUrl(d.previous_reports));
//     });
//   }, [open, id]);

//   function set(key, value) {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   }

//   async function onSubmit(e) {
//     e.preventDefault();
//     if (!form.patient_name) {
//       setError('Patient name is required');
//       return;
//     }
//     try {
//       const payload = toFormData(form, 'previous_reports', file);
//       if (id) await healthLibraryApi.update(id, payload);
//       else await healthLibraryApi.create(payload);
//       toast.success(id ? 'Patient record updated' : 'Patient record created');
//       onSaved?.();
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     }
//   }

//   return (
//     <Drawer open={open} title={id ? 'Edit patient record' : 'Add patient record'} onClose={onClose} width="720px">
//       <form className="drawer-body form-grid" onSubmit={onSubmit}>
//         <div>
//           <label>Name *</label>
//           <input value={form.patient_name} onChange={(e) => set('patient_name', e.target.value)} />
//         </div>
//         <div>
//           <label>Phone number</label>
//           <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
//         </div>
//         <div>
//           <label>Email id</label>
//           <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
//         </div>
//         <div>
//           <label>Country</label>
//           <input value={form.country} onChange={(e) => set('country', e.target.value)} />
//         </div>
//         <div>
//           <label>Disease</label>
//           <input value={form.disease} onChange={(e) => set('disease', e.target.value)} />
//         </div>
//         <div>
//           <label>Hospital name</label>
//           <input value={form.hospital_name} onChange={(e) => set('hospital_name', e.target.value)} />
//         </div>
//         <div>
//           <label>Treatment starting date</label>
//           <input type="date" value={form.treatment_start_date} onChange={(e) => set('treatment_start_date', e.target.value)} />
//         </div>
//         <div>
//           <label>Treatment ending date</label>
//           <input type="date" value={form.treatment_end_date} onChange={(e) => set('treatment_end_date', e.target.value)} />
//         </div>
//         <div>
//           <label>Amount</label>
//           <input type="number" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
//         </div>
//         <div className="full">
//           <FileUpload label="Previous reports" existingUrl={existing} onFile={setFile} />
//         </div>
//         <div className="full">
//           <label>Post op details</label>
//           <textarea value={form.post_op_details || ''} onChange={(e) => set('post_op_details', e.target.value)} />
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
