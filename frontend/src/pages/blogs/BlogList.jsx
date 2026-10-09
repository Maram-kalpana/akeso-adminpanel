
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { usePagedList } from "../../hooks";
import { editorialApi } from "../../api/editorial";
import { mediaUrl } from "../../utils";
import BlogForm from "./BlogForm";

const COLORS = {
  primary: "#13899B",
  dark: "#153F4A",
  border: "#E1E9EF",
  muted: "#6B7C89",
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: COLORS.primary,
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function descriptionPreview(row) {
  const html = row.content || row.short_description || "";

  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function ContentTab({ kind, onAddReady }) {
  const api = useMemo(() => editorialApi(kind), [kind]);

  const {
    rows,
    total,
    page,
    setPage,
    search,
    setSearch,
    onSearch,
    reload,
    limit,
  } = usePagedList(api);

  const [drawer, setDrawer] = useState({
    open: false,
    id: null,
  });

  const [deleting, setDeleting] = useState(null);

  const label = kind === "blogs" ? "Blog" : "Case Study";

  const openAdd = useCallback(() => {
    setDrawer({ open: true, id: null });
  }, []);

  useEffect(() => {
    onAddReady(openAdd);

    return () => onAddReady(null);
  }, [onAddReady, openAdd]);

  const closeDrawer = () => {
    setDrawer({ open: false, id: null });
  };

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await api.remove(deleting.id);
      toast.success(`${label} deleted successfully`);
      setDeleting(null);
      reload();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    }
  }

  const columns = [
    {
      key: "thumbnail",
      label: "Image",
      render: (row) =>
        row.thumbnail ? (
          <img
            src={mediaUrl(row.thumbnail)}
            alt={row.title || ""}
            style={{
              width: 76,
              height: 54,
              objectFit: "cover",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
            }}
          />
        ) : (
          <div
            style={{
              width: 76,
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F1F5F9",
              borderRadius: 8,
              color: "#94A3B8",
              fontSize: 11,
            }}
          >
            No image
          </div>
        ),
    },
    {
      key: "title",
      label: "Name",
      render: (row) => (
        <span
          style={{
            color: COLORS.dark,
            fontWeight: 600,
            minWidth: 140,
            display: "inline-block",
          }}
        >
          {row.title}
        </span>
      ),
    },
    {
      key: "speciality",
      label: "Speciality",
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            background: "#EAF5F5",
            color: "#087A86",
            borderRadius: 20,
            padding: "6px 10px",
            fontSize: 12,
          }}
        >
          {row.speciality_name ||
            row.speciality?.name ||
            "—"}
        </span>
      ),
    },
    {
      key: "content",
      label: "Description",
      render: (row) => {
        const description = descriptionPreview(row);

        return (
          <span
            title={description}
            style={{
              display: "block",
              maxWidth: 250,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "#64748B",
            }}
          >
            {description || "—"}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Added Date",
      render: (row) => (
        <span style={{ whiteSpace: "nowrap" }}>
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : "—"}
        </span>
      ),
    },
    {
      key: "is_published",
      label: "Status",
      render: (row) => {
        const published = Number(row.is_published) === 1;

        return (
          <span
            style={{
              display: "inline-block",
              padding: "6px 11px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: published
                ? "#ECFDF5"
                : "#FFFBEB",
              color: published
                ? "#047857"
                : "#B45309",
            }}
          >
            {published ? "Published" : "Draft"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() =>
              setDrawer({ open: true, id: row.id })
            }
            style={{
              ...buttonStyle,
              background: "#EDF8FA",
              color: "#087A86",
              border: "1px solid #B9DFE4",
              padding: "8px 12px",
            }}
          >
            ✎ Edit
          </button>

          <button
            type="button"
            onClick={() => setDeleting(row)}
            style={{
              ...buttonStyle,
              background: "#FFF1F2",
              color: "#DC2626",
              border: "1px solid #FECDD3",
              padding: "8px 12px",
            }}
          >
            × Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <form
          onSubmit={onSearch}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: 10,
            width: "auto",
            maxWidth: "100%",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${
              kind === "blogs" ? "blogs" : "case studies"
            }...`}
            style={{
              width: 270,
              maxWidth: "55vw",
              minWidth: 0,
              flexShrink: 1,
              height: 40,
              padding: "9px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              outlineColor: COLORS.primary,
              background: "#FFFFFF",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              ...buttonStyle,
              height: 40,
              background: "#E7EDF2",
              color: COLORS.dark,
              flexShrink: 0,
            }}
          >
            Search
          </button>
        </form>

        <span
          style={{
            color: COLORS.muted,
            fontSize: 13,
          }}
        >
          {total} {total === 1 ? label : `${label}s`}
        </span>
      </div>

      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 15,
          overflowX: "auto",
          boxShadow: "0 2px 10px rgba(15,61,76,0.03)",
        }}
      >
        <div style={{ minWidth: 900 }}>
          <DataTable rows={rows} columns={columns} />
        </div>
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPage={setPage}
      />

      <BlogForm
        kind={kind}
        id={drawer.id}
        open={drawer.open}
        onClose={closeDrawer}
        onSaved={reload}
      />

      {deleting && (
        <ConfirmDeleteModal
          title={deleting.title}
          onClose={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

export default function BlogList() {
  const [tab, setTab] = useState("blogs");
  const [addAction, setAddAction] = useState(null);

  const onAddReady = useCallback((callback) => {
    setAddAction(() => callback);
  }, []);

  const isBlogs = tab === "blogs";

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div
          role="tablist"
          aria-label="Content type"
          style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
          }}
        >
          {[
            { value: "blogs", label: "Blogs" },
            { value: "cases", label: "Case Studies" },
          ].map((item) => {
            const active = tab === item.value;

            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: active
                    ? "3px solid #13899B"
                    : "3px solid transparent",
                  borderRadius: 0,
                  padding: "12px 0 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: active
                    ? "#087A86"
                    : "#64748B",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => addAction?.()}
          disabled={!addAction}
          style={{
            ...buttonStyle,
            opacity: addAction ? 1 : 0.6,
          }}
        >
          <span
            style={{
              fontSize: 19,
              lineHeight: 1,
            }}
          >
            +
          </span>
          Add New {isBlogs ? "Blog" : "Case Study"}
        </button>
      </div>

      <ContentTab
        key={tab}
        kind={tab}
        onAddReady={onAddReady}
      />
    </div>
  );
}




// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import DataTable from '../../components/DataTable';
// import Pagination from '../../components/Pagination';
// import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
// import { blogsApi } from '../../api';
// import { usePagedList } from '../../hooks';
// import { clip, mediaUrl } from '../../utils';
// import BlogForm from './BlogForm';

// export default function BlogList() {
//   const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(blogsApi);
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
//       await blogsApi.remove(deleting.id);
//       toast.success('Blog deleted');
//       setDeleting(null);
//       reload();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Delete failed');
//     }
//   }

//   const columns = [
//     { key: 'thumbnail', label: 'Image', render: (r) => r.thumbnail ? <img className="thumb" src={mediaUrl(r.thumbnail)} alt="" /> : '—' },
//     { key: 'title', label: 'Blog name' },
//     { key: 'content', label: 'Description', render: (r) => <span className="cell-clip">{clip(r.content)}</span> },
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
//         <h1>Blogs</h1>
//         <button className="btn" type="button" onClick={openAdd}>Add New</button>
//       </div>
//       <form className="toolbar" onSubmit={onSearch}>
//         <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs..." />
//         <button className="btn secondary" type="submit">Search</button>
//       </form>
//       <DataTable columns={columns} rows={rows} />
//       <Pagination page={page} limit={limit} total={total} onPage={setPage} />
//       <ConfirmDeleteModal title={deleting?.title} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
//       <BlogForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
//     </div>
//   );
// }
