import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../../components/DataTable";


import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";


import Pagination from "../../components/Pagination";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { healthLibraryApi } from "../../api";
import HealthLibraryForm from "./HealthLibraryForm";
const TABS = [
  ["estimate", "Request an Estimate"],
  ["contact", "Contact Form"],
  ["callback", "Request a Call"],
];
const formatDate = (x) => (x ? new Date(x).toLocaleDateString("en-IN") : "—");
export default function HealthLibraryList() {
  const [type, setType] = useState("estimate");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  // const [input, setInput] = useState("");
  // const [search, setSearch] = useState("");
  // const [from, setFrom] = useState("");
  // const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, id: null, view: false });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
  const timer = setTimeout(() => {
    setPage(1);
    setSearch(searchInput.trim());
  }, 350);

  return () => clearTimeout(timer);
}, [searchInput]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await healthLibraryApi.list({
        type,
        page,
        limit,
        search,
        date: selectedDate,
      });
      setRows(data.rows || []);
      setTotal(Number(data.total || 0));
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load records");
    } finally {
      setLoading(false);
    }
  }, [type, page, search, selectedDate]);
  useEffect(() => {
    reload();
  }, [reload]);

  function changeTab(next) {
  setType(next);
  setPage(1);
  setSearchInput("");
  setSearch("");
  setSelectedDate("");
}

  async function remove() {
    try {
      await healthLibraryApi.remove(deleting.id);
      setDeleting(null);
      toast.success("Record deleted");
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  }
  const columns = (
    type === "estimate"
      ? [
          ["patient_name", "Name"],
          ["phone", "Phone"],
          ["email", "Email"],
          ["country", "Country"],
          ["disease", "Disease"],
          ["hospital_name", "Hospital"],
          ["created_at", "Date"],
        ]
      : type === "contact"
        ? [
            ["patient_name", "Name"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["subject", "Subject"],
            ["message", "Message"],
            ["created_at", "Date"],
          ]
        : [
            ["patient_name", "Name"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["preferred_time", "Preferred Time"],
            ["message", "Message"],
            ["created_at", "Date"],
          ]
  ).map(([key, label]) => ({
    key,
    label,
    render: (r) => (key === "created_at" ? formatDate(r[key]) : r[key] || "—"),
  }));
  
columns.push({
  key: "actions",
  label: "Actions",
  render: (r) => (
    <div
      className="actions"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "nowrap",
      }}
    >
      {/* VIEW ICON */}
      <button
        type="button"
        title="View"
        aria-label="View"
        onClick={() =>
          setDrawer({
            open: true,
            id: r.id,
            view: true,
          })
        }
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #dbe4ea",
          borderRadius: 7,
          background: "#eff6ff",
          color: "#2563eb",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <VisibilityOutlinedIcon fontSize="small" />
      </button>

      {/* EDIT ICON */}
      <button
        type="button"
        title="Edit"
        aria-label="Edit"
        onClick={() =>
          setDrawer({
            open: true,
            id: r.id,
            view: false,
          })
        }
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #dbe4ea",
          borderRadius: 7,
          background: "#f0fdfa",
          color: "#0f766e",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <EditOutlinedIcon fontSize="small" />
      </button>

      {/* DELETE ICON */}
      <button
        type="button"
        title="Delete"
        aria-label="Delete"
        onClick={() => setDeleting(r)}
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #fecaca",
          borderRadius: 7,
          background: "#fef2f2",
          color: "#dc2626",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <DeleteOutlinedIcon fontSize="small" />
      </button>
    </div>
  ),
});

  // columns.push({
  //   key: "actions",
  //   label: "Actions",
  //   render: (r) => (
  //     <div className="actions">
  //       <button
  //         type="button"
  //         className="btn secondary small"
  //         onClick={() => setDrawer({ open: true, id: r.id, view: true })}
  //       >
  //         View
  //       </button>
  //       <button
  //         type="button"
  //         className="btn secondary small"
  //         onClick={() => setDrawer({ open: true, id: r.id, view: false })}
  //       >
  //         Edit
  //       </button>
  //       <button
  //         type="button"
  //         className="btn danger small"
  //         onClick={() => setDeleting(r)}
  //       >
  //         Delete
  //       </button>
  //     </div>
  //   ),
  // });
  return (
    <div>
      <div className="page-head" style={{ gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => changeTab(key)}
              className={type === key ? "btn" : "btn secondary"}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="btn"
          type="button"
          onClick={() => setDrawer({ open: true, id: null, view: false })}
        >
          Add New
        </button>
      </div>
      
{/* LIVE SEARCH + SINGLE DATE FILTER */}
<div
  className="toolbar"
  style={{
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  }}
>
  {/* SEARCH INPUT - AUTO SEARCH */}
  <input
    type="text"
    placeholder="Search name, phone, email..."
    value={searchInput}
    onChange={(e) => {
      setSearchInput(e.target.value);
    }}
    style={{
      width: 320,
      maxWidth: "100%",
    }}
  />

  {/* SINGLE DATE PICKER */}
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => {
      setSelectedDate(e.target.value);
      setPage(1);
    }}
    aria-label="Filter by date"
    title="Select date"
    style={{
      width: 200,
      maxWidth: "100%",
    }}
  />

  {/* CLEAR FILTERS */}
  {(searchInput || selectedDate) && (
    <button
      type="button"
      className="btn secondary"
      onClick={() => {
        setSearchInput("");
        setSearch("");
        setSelectedDate("");
        setPage(1);
      }}
    >
      Clear
    </button>
  )}
</div>

      {loading ? (
        <div style={{ padding: 16 }}>Loading...</div>
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal
        title={deleting?.patient_name || ""}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      />
      <HealthLibraryForm
        open={drawer.open}
        id={drawer.id}
        type={type}
        view={drawer.view}
        onClose={() => setDrawer({ open: false, id: null, view: false })}
        onSaved={reload}
      />
    </div>
  );
}







// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import DataTable from '../../components/DataTable';
// import Pagination from '../../components/Pagination';
// import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
// import { healthLibraryApi } from '../../api';
// import { usePagedList } from '../../hooks';
// import { clip, dateInput, mediaUrl } from '../../utils';
// import HealthLibraryForm from './HealthLibraryForm';

// export default function HealthLibraryList() {
//   const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(healthLibraryApi);
//   const [deleting, setDeleting] = useState(null);
//   const [drawer, setDrawer] = useState({ open: false, id: null });

//   function openAdd() {
//     setDrawer({ open: true, id: null });
//   }
//   function openEdit(id) {
//     setDrawer({ open: true, id });
//   }
//   function closeDrawer() {
//     setDrawer({ open: false, id: null });
//   }

//   async function confirmDelete() {
//     try {
//       await healthLibraryApi.remove(deleting.id);
//       toast.success('Record deleted');
//       setDeleting(null);
//       reload();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Delete failed');
//     }
//   }

//   const columns = [
//     { key: 'patient_name', label: 'Name', render: (r) => r.patient_name || r.title },
//     { key: 'phone', label: 'Phone' },
//     { key: 'email', label: 'Email' },
//     { key: 'country', label: 'Country' },
//     { key: 'disease', label: 'Disease' },
//     { key: 'hospital_name', label: 'Hospital' },
//     { key: 'treatment_start_date', label: 'Start date', render: (r) => dateInput(r.treatment_start_date) || '—' },
//     { key: 'treatment_end_date', label: 'End date', render: (r) => dateInput(r.treatment_end_date) || '—' },
//     { key: 'amount', label: 'Amount' },
//     {
//       key: 'previous_reports',
//       label: 'Reports',
//       render: (r) => r.previous_reports ? <a href={mediaUrl(r.previous_reports)} target="_blank" rel="noreferrer">View</a> : '—',
//     },
//     { key: 'post_op_details', label: 'Post op', render: (r) => <span className="cell-clip">{clip(r.post_op_details, 40)}</span> },
//     {
//       key: 'actions',
//       label: 'Actions',
//       render: (r) => (
//         <div className="actions">
//           <button className="btn secondary small" type="button" onClick={() => openEdit(r.id)}>Edit</button>
//           <button className="btn danger small" type="button" onClick={() => setDeleting(r)}>Delete</button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="page-head">
//         <h1>Health Library</h1>
//         <button className="btn" type="button" onClick={openAdd}>Add New</button>
//       </div>
//       <form className="toolbar" onSubmit={onSearch}>
//         <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients..." />
//         <button className="btn secondary" type="submit">Search</button>
//       </form>
//       <DataTable columns={columns} rows={rows} />
//       <Pagination page={page} limit={limit} total={total} onPage={setPage} />
//       <ConfirmDeleteModal title={deleting?.patient_name || deleting?.title} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
//       <HealthLibraryForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
//     </div>
//   );
// }
