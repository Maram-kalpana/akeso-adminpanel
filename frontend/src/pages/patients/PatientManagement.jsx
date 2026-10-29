import { useEffect, useState } from "react";
import api from "../../api/client";
const SECTIONS = {
  visa: [
    ["visaStatus", "Visa application status"],
    ["visaApprovalDate", "Approval date"],
    ["visaExpiry", "Visa expiry date"],
    ["internalRemarks", "Internal visa remarks"],
  ],
  medical: [["doctorNotes", "Treating doctor notes and recommendations"]],
  treatment: [
    ["treatmentType", "Treatment / surgery"],
    ["specialty", "Medical specialty"],
    ["treatmentPlan", "Proposed treatment plan"],
    ["treatmentDuration", "Expected duration"],
    ["treatmentStatus", "Treatment status"],
    ["plannedAdmission", "Planned admission date"],
    ["plannedDischarge", "Planned discharge date"],
    ["actualAdmission", "Actual admission date"],
    ["actualDischarge", "Actual discharge date"],
  ],
  hospital: [
    ["doctorName", "Treating doctor"],
    ["doctorSpecialty", "Specialty"],
    ["hospitalName", "Hospital"],
    ["hospitalAddress", "Address"],
    ["hospitalPhone", "Phone"],
    ["coordinatorName", "Coordinator"],
    ["coordinatorPhone", "Coordinator phone"],
    ["admissionConfirmation", "Admission confirmation"],
  ],
  stay: [
    ["hotelName", "Accommodation name"],
    ["hotelAddress", "Address"],
    ["hotelPhone", "Phone"],
    ["checkIn", "Check-in date"],
    ["checkOut", "Check-out date"],
    ["bookingReference", "Booking reference"],
    ["accommodationStatus", "Status"],
    ["localTransport", "Local transportation"],
    ["airportPickup", "Airport pickup"],
  ],
  travel: [
    ["departureCountry", "Departure country"],
    ["departureCity", "Departure city"],
    ["arrivalCity", "Arrival city"],
    ["arrivalAirport", "Airport"],
    ["arrivalDate", "Arrival date"],
    ["arrivalTime", "Arrival time"],
    ["airline", "Airline"],
    ["flightNumber", "Flight number"],
    ["pnr", "PNR"],
    ["pickupStatus", "Pickup status"],
    ["returnDate", "Return date"],
    ["returnTime", "Return time"],
    ["returnFlight", "Return flight"],
    ["returnPnr", "Return PNR"],
    ["companions", "Companions"],
    ["itinerary", "Itinerary"],
  ],
  appointments: [
    ["consultationDate", "Initial consultation date"],
    ["appointmentDoctor", "Doctor"],
    ["appointmentSpecialty", "Specialty"],
    ["appointmentDate", "Appointment date"],
    ["appointmentTime", "Time"],
    ["timezone", "Time zone"],
    ["appointmentType", "Appointment type"],
    ["meetingLink", "Meeting link"],
    ["appointmentStatus", "Status"],
    ["previousConsultations", "Previous consultations"],
    ["nextFollowup", "Next follow-up"],
    ["postTreatmentSchedule", "Post-treatment schedule"],
  ],
  payments: [
    ["estimatedCost", "Estimated cost"],
    ["approvedQuotation", "Approved quotation"],
    ["advancePayment", "Advance payment"],
    ["paymentStatus", "Payment status"],
    ["accommodationCost", "Accommodation cost"],
    ["transportCost", "Transport cost"],
    ["otherExpenses", "Other expenses"],
    ["balance", "Balance"],
    ["transactionReference", "Transaction reference"],
    ["finalStatement", "Final statement"],
  ],
  journey: [
    ["stage", "Current journey stage"],
    ["status", "Status"],
    ["date", "Date"],
    ["requirements", "Pending requirements"],
    ["remarks", "Remarks"],
  ],
};
const box = {
  border: "1px solid #dce7e6",
  borderRadius: 12,
  padding: 18,
  background: "#fff",
  marginBottom: 16,
};
const inp = {
  width: "100%",
  border: "1px solid #d4e1df",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
};
const btn = {
  background: "#064B50",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: 600,
};
const docCategories = {
  treatment: "Treatment Plan",
  hospital: "Admission Confirmation",
  stay: "Accommodation Confirmation",
  travel: "Flight Ticket",
  appointments: "Doctor Consultation",
  payments: "Invoice",
  medical: "Medical Reports",
  visa: "Visa",
};
export default function PatientManagement() {
  const [rows, setRows] = useState([]),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(null),
    [section, setSection] = useState("treatment"),
    [draft, setDraft] = useState({}),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const { data } = await api.get("/patient-care/admin", {
        params: { search },
      });
      setRows(data.rows || []);
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not load patients");
    }
  }
  useEffect(() => {
    load();
  }, [search]);
  async function open(id) {
    try {
      const { data } = await api.get(`/patient-care/admin/${id}`);
      setSelected(data);
      setSection("treatment");
      setDraft(data.sections?.treatment || {});
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not load patient");
    }
  }
  function changeSection(key) {
    setSection(key);
    setDraft(selected?.sections?.[key] || {});
  }
  async function save() {
    setBusy(true);
    try {
      const { data } = await api.patch(
        `/patient-care/admin/${selected.customer.id}/${section}`,
        draft,
      );
      setSelected((prev) => ({
        ...prev,
        sections: { ...prev.sections, [section]: data.data },
      }));
      setMessage("Patient record updated successfully");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("sectionId", section);
    fd.append("category", docCategories[section] || "Other");
    try {
      await api.post(
        `/patient-care/admin/${selected.customer.id}/documents`,
        fd,
      );
      await open(selected.customer.id);
      changeSection(section);
      setMessage("Document uploaded");
    } catch (e) {
      setMessage(e.response?.data?.message || "Upload failed");
    }
  }
  async function download(doc) {
    try {
      const response = await api.get(
        `/patient-care/admin/${selected.customer.id}/documents/${doc.id}`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage("Download failed");
    }
  }
  return (
    <div>
      <div className="page-head">
        <h1>Patient Management</h1>
      </div>
      {message && (
        <div role="status" style={{ ...box, color: "#064B50" }}>
          {message}
        </div>
      )}
      {!selected ? (
        <div style={box}>
          <input
            style={{ ...inp, maxWidth: 420, marginBottom: 18 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or Patient ID"
          />
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Patient ID",
                    "Name",
                    "Email",
                    "Treatment Status",
                    "Arrival Date",
                    "Action",
                  ].map((x) => (
                    <th
                      key={x}
                      style={{ padding: 12, borderBottom: "1px solid #ddd" }}
                    >
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    {[
                      r.patientId || `AKESO-${String(r.id).padStart(8, "0")}`,
                      r.name,
                      r.email,
                      r.treatmentStatus || "—",
                      r.arrivalDate || "—",
                    ].map((x, i) => (
                      <td
                        key={i}
                        style={{ padding: 12, borderBottom: "1px solid #eee" }}
                      >
                        {x}
                      </td>
                    ))}
                    <td>
                      <button style={btn} onClick={() => open(r.id)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p>No registered patients found.</p>}
          </div>
        </div>
      ) : (
        <div>
          <button
            style={{ ...btn, marginBottom: 15 }}
            onClick={() => setSelected(null)}
          >
            ← Back to Patients
          </button>
          <div style={box}>
            <h2>
              {selected.customer.name} — {selected.patientId}
            </h2>
            <p>
              {selected.customer.email} · {selected.customer.phone}
            </p>
          </div>
          <div style={{ ...box, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(SECTIONS).map((k) => (
              <button
                key={k}
                onClick={() => changeSection(k)}
                style={{
                  ...btn,
                  background: section === k ? "#064B50" : "#e9f3f1",
                  color: section === k ? "white" : "#064B50",
                }}
              >
                {k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
          <div style={box}>
            <h3 style={{ textTransform: "capitalize", marginBottom: 18 }}>
              {section} Details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                gap: 16,
              }}
            >
              {SECTIONS[section].map(([key, label]) => (
                <label
                  key={key}
                  style={{ fontWeight: 600, fontSize: 14, color: "#263F41" }}
                >
                  {label}
                  <input
                    style={{ ...inp, marginTop: 7 }}
                    value={draft[key] || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                style={{ ...btn, background: "#e9f3f1", color: "#064B50" }}
                onClick={() => setDraft(selected.sections?.[section] || {})}
              >
                Cancel
              </button>
              <button disabled={busy} style={btn} onClick={save}>
                {busy ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
          <div style={box}>
            <h3>Section Documents</h3>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={(e) => {
                upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <div style={{ marginTop: 16 }}>
              {selected.documents
                .filter((d) => d.sectionId === section)
                .map((doc) => (
                  <div
                    key={doc.id}
                    style={{ padding: 10, borderBottom: "1px solid #eee" }}
                  >
                    {doc.name}{" "}
                    <button
                      style={{ ...btn, marginLeft: 12 }}
                      onClick={() => download(doc)}
                    >
                      Download
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
