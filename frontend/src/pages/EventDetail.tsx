import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useParams, Link } from "react-router-dom";
import { fetchAvailability, purchaseTickets, fetchEvents } from "../api/event";

interface Row {
    name: string;
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
}

interface Section {
    name: string;
    rows: Row[];
}

interface Event {
    _id: string;
    name: string;
    date: string;
    location?: string;
    description?: string;
}

function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const [sections, setSections] = useState<Section[]>([]);
    const [event, setEvent] = useState<Event | null>(null);
    const [sectionName, setSectionName] = useState("");
    const [rowName, setRowName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "danger" | "info" | "">("");
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (id) {
            Promise.all([
                fetchAvailability(id),
                fetchEvents()
            ]).then(([availabilityData, eventsData]) => {
                if (availabilityData.success) {
                    setSections(availabilityData.availability);
                }
                if (eventsData.success) {
                    const currentEvent = eventsData.events.find((e: Event) => e._id === id);
                    setEvent(currentEvent || null);
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handlePurchase = async () => {
        if (!id || !sectionName || !rowName || quantity < 1) {
            setMessage("Please fill in all required fields");
            setMessageType("danger");
            return;
        }

        setBooking(true);
        setMessage("");
        setMessageType("");

        try {
            const data = await purchaseTickets(
                id,
                sectionName,
                rowName,
                quantity
            );
            
            if (data.success) {
                setMessage("Tickets booked successfully!");
                setMessageType("success");
                void Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Booking confirmed",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                
                // Show group discount alert if applicable
                if (data.groupDiscount) {
                    setTimeout(() => {
                        setMessage("Group Discount Applied! You saved money on your booking!");
                        setMessageType("info");
                    }, 2000);
                }
                
                // Refresh availability
                const availabilityData = await fetchAvailability(id);
                if (availabilityData.success) {
                    setSections(availabilityData.availability);
                }
                
                // Reset form
                setSectionName("");
                setRowName("");
                setQuantity(1);
            } else {
                setMessage(data.message || "Booking failed. Please try again.");
                setMessageType("danger");
                void Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "error",
                    title: data.message || "Booking failed",
                    showConfirmButton: false,
                    timer: 2200,
                    timerProgressBar: true
                });
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            setMessageType("danger");
            void Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Something went wrong",
                showConfirmButton: false,
                timer: 2200,
                timerProgressBar: true
            });
        } finally {
            setBooking(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
    };

    const getAvailableRows = () => {
        if (!sectionName) return [];
        const section = sections.find(s => s.name === sectionName);
        return section ? section.rows : [];
    };

    const getMaxTickets = () => {
        if (!sectionName || !rowName) return 1;
        const row = getAvailableRows().find(r => r.name === rowName);
        return row ? row.availableSeats : 1;
    };

    // Event booking UX does not select specific seats; quantity only

    if (loading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading event details...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Event Not Found</h4>
                    <p>The event you're looking for doesn't exist or has been removed.</p>
                    <Link to="/" className="btn btn-primary">Back to Events</Link>
                </div>
            </div>
        );
    }

    const { date, time } = formatDate(event.date);

    return (
        <>
            {/* Header */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container">
                    <Link className="navbar-brand fw-bold" to="/">
                        🎟️ Event Booking
                    </Link>
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container-fluid py-5 fade-in">
                {/* Back Button */}
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="mb-4">
                            <Link to="/" className="btn btn-outline-secondary">
                                ← Back to Events
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Event Header */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h1 className="display-5 fw-bold text-primary mb-3">{event.name}</h1>
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-calendar-event text-primary me-3 fs-4"></i>
                                            <div>
                                                <h6 className="mb-1 fw-semibold">Date & Time</h6>
                                                <p className="mb-0 text-muted">{date}</p>
                                                <p className="mb-0 text-muted">{time}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {event.location && (
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="bi bi-geo-alt text-primary me-3 fs-4"></i>
                                                <div>
                                                    <h6 className="mb-1 fw-semibold">Location</h6>
                                                    <p className="mb-0 text-muted">{event.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {event.description && (
                                    <div className="mt-3">
                                        <h6 className="fw-semibold mb-2">Description</h6>
                                        <p className="text-muted">{event.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center">
                    {/* Availability Section */}
                    <div className="col-xl-8 col-lg-7 col-md-12 mb-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Seat Availability</h4>
                            </div>
                            <div className="card-body">
                                {sections.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-muted">No availability information available.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Section</th>
                                                    <th>Row</th>
                                                    <th>Available</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sections.map(section => 
                                                    section.rows.map(row => (
                                                        <tr key={`${section.name}-${row.name}`}>
                                                            <td className="fw-semibold">{section.name}</td>
                                                            <td>{row.name}</td>
                                                            <td>
                                                                <span className={`badge ${row.availableSeats > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                                    {row.availableSeats}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {row.availableSeats > 0 ? (
                                                                    <span className="text-success fw-semibold">Available</span>
                                                                ) : (
                                                                    <span className="text-danger fw-semibold">Sold Out</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="col-xl-4 col-lg-5 col-md-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Book Tickets</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={(e) => { e.preventDefault(); handlePurchase(); }}>
                                    <div className="mb-3">
                                        <label htmlFor="section" className="form-label fw-semibold">Section</label>
                                        <select 
                                            id="section"
                                            className="form-select"
                                            value={sectionName}
                                            onChange={(e) => {
                                                setSectionName(e.target.value);
                                                setRowName("");
                                            }}
                                            required
                                        >
                                            <option value="">Select Section</option>
                                            {sections.map(section => (
                                                <option key={section.name} value={section.name}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="row" className="form-label fw-semibold">Row</label>
                                        <select 
                                            id="row"
                                            className="form-select"
                                            value={rowName}
                                            onChange={(e) => setRowName(e.target.value)}
                                            disabled={!sectionName}
                                            required
                                        >
                                            <option value="">Select Row</option>
                                            {getAvailableRows().map(row => (
                                                <option key={row.name} value={row.name}>
                                                    {row.name} ({row.availableSeats} available)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="quantity" className="form-label fw-semibold">Number of Tickets</label>
                                        <input 
                                            type="number" 
                                            id="quantity"
                                            className="form-control"
                                            min="1"
                                            max={getMaxTickets()}
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            disabled={!rowName}
                                            required
                                        />
                                        {rowName && (
                                            <div className="form-text">
                                                Maximum {getMaxTickets()} tickets available
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type="submit"
                                        className="btn btn-primary w-100 fw-semibold"
                                        disabled={booking || !sectionName || !rowName || quantity < 1}
                                    >
                                        {booking ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Booking...
                                            </>
                                        ) : (
                                            'Book Tickets'
                                        )}
                                    </button>
                                </form>

                                {/* Messages */}
                                {message && (
                                    <div className={`alert alert-${messageType} mt-3`} role="alert">
                                        {message}
                                    </div>
                                )}

                                {/* Group Discount Info */}
                                {quantity >= 4 && (
                                    <div className="alert alert-info mt-3" role="alert">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Group Discount Available! Book 4+ tickets to save money.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EventDetail;
