import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createEvent } from "../api/event";

type Row = { name: string; totalSeats: number };
type Section = { name: string; rows: Row[] };

function CreateEvent() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [sections, setSections] = useState<Section[]>([
        { name: "Section A", rows: [{ name: "Row 1", totalSeats: 10 }] }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "danger" | "warning" | "">("");

    const addSection = () => {
        setSections(prev => ([...prev, { name: `Section ${String.fromCharCode(65 + prev.length)}`, rows: [{ name: "Row 1", totalSeats: 1 }] }]));
    };

    const removeSection = (index: number) => {
        setSections(prev => prev.filter((_, i) => i !== index));
    };

    const addRow = (sIndex: number) => {
        setSections(prev => prev.map((s, i) => i === sIndex ? ({ ...s, rows: [...s.rows, { name: `Row ${s.rows.length + 1}`, totalSeats: 1 }] }) : s));
    };

    const removeRow = (sIndex: number, rIndex: number) => {
        setSections(prev => prev.map((s, i) => i === sIndex ? ({ ...s, rows: s.rows.filter((_, ri) => ri !== rIndex) }) : s));
    };

    const updateSectionName = (index: number, value: string) => {
        setSections(prev => prev.map((s, i) => i === index ? ({ ...s, name: value }) : s));
    };

    const updateRow = (sIndex: number, rIndex: number, key: keyof Row, value: string) => {
        setSections(prev => prev.map((s, i) => {
            if (i !== sIndex) return s;
            const rows = s.rows.map((r, ri) => ri === rIndex ? ({ ...r, [key]: key === "totalSeats" ? Number(value) : value }) : r);
            return { ...s, rows };
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");
        setMessageType("");
        const payload = { name, date, sections };
        const res = await createEvent(payload);
        setSubmitting(false);
        if (res?.success) {
            setMessageType("success");
            setMessage("Event created successfully");
            setTimeout(() => navigate("/"), 800);
        } else {
            setMessageType("danger");
            setMessage(res?.message || "Failed to create event");
        }
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container">
                    <Link className="navbar-brand fw-bold" to="/">🎟️ Event Booking</Link>
                </div>
            </nav>

            <div className="container my-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0">Create Event</h2>
                    <Link to="/" className="btn btn-outline-secondary">← Back</Link>
                </div>

                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 mb-2">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Event Name</label>
                                    <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)} // restrict past date & time
                                        required
                                    />
                                </div>
                            </div>

                            <hr />
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="mb-0">Sections</h5>
                                <button type="button" className="btn btn-sm btn-primary" onClick={addSection}>+ Add Section</button>
                            </div>

                            {sections.map((section, sIndex) => (
                                <div key={sIndex} className="border rounded p-3 mb-3">
                                    <div className="d-flex gap-2 align-items-end mb-2">
                                        <div className="flex-grow-1">
                                            <label className="form-label">Section Name</label>
                                            <input className="form-control" value={section.name} onChange={e => updateSectionName(sIndex, e.target.value)} required />
                                        </div>
                                        <button type="button" className="btn btn-outline-danger" onClick={() => removeSection(sIndex)} disabled={sections.length === 1}>Remove</button>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0">Rows</h6>
                                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => addRow(sIndex)}>+ Add Row</button>
                                    </div>

                                    {section.rows.map((row, rIndex) => (
                                        <div key={rIndex} className="row g-2 align-items-end mb-2">
                                            <div className="col-md-7">
                                                <label className="form-label">Row Name</label>
                                                <input className="form-control" value={row.name} onChange={e => updateRow(sIndex, rIndex, "name", e.target.value)} required />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Total Seats</label>
                                                <input type="number" min={1} className="form-control" value={row.totalSeats} onChange={e => updateRow(sIndex, rIndex, "totalSeats", e.target.value)} required />
                                            </div>
                                            <div className="col-md-2 d-grid">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => removeRow(sIndex, rIndex)} disabled={section.rows.length === 1}>Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {message && (
                                <div className={`alert alert-${messageType} mt-2`}>{message}</div>
                            )}

                            <div className="d-grid">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? "Creating..." : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateEvent;


