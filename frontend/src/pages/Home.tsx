import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../api/event";

interface Event {
    _id: string;
    name: string;
    date: string;
    location?: string;
    description?: string;
}

function Home() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const heroImages = useMemo(() => [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop"
    ], []);
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        fetchEvents().then(data => {
            if (data.success) setEvents(data.events);
            setLoading(false);
        });
    }, []);

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

    useEffect(() => {
        const id = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroImages.length);
        }, 3500);
        return () => clearInterval(id);
    }, [heroImages.length]);

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
                                <Link className="nav-link active" to="/">Home</Link>
                            </li>
                            <li className="nav-item ms-2">
                                <Link className="btn btn-light btn-sm fw-semibold" to="/create-event">
                                    + Create Event
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section: 50% text + 50% image carousel */}
            <div className=" bg-primary text-white py-5">
                <div className="row align-items-center" style={{ minHeight: 320 }}>
                    <div className="col-12 col-lg-6 px-4 px-lg-5 mb-4 mb-lg-0">
                        <h1 className="display-4 fw-bold mb-3">Discover Amazing Events</h1>
                        <p className="lead text-white-50 mb-4">Book your tickets for the best events in town</p>
                    </div>
                    <div className="col-12 col-lg-6 px-0">
                        <div className="position-relative overflow-hidden rounded-3 shadow" style={{ height: 320 }}>
                            {heroImages.map((src, idx) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt="Event preview"
                                    className="position-absolute top-0 start-0 w-100 h-100"
                                    style={{
                                        objectFit: "cover",
                                        opacity: heroIndex === idx ? 1 : 0,
                                        transition: "opacity 600ms ease-in-out"
                                    }}
                                />
                            ))}
                            <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-2 mb-2">
                                {heroImages.map((_, i) => (
                                    <button
                                        key={i}
                                        aria-label={`slide-${i+1}`}
                                        onClick={() => setHeroIndex(i)}
                                        className={`btn btn-sm rounded-circle p-0 ${heroIndex === i ? 'btn-light' : 'btn-outline-light'}`}
                                        style={{ width: 10, height: 10 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div id="events" className="container-fluid py-5 fade-in">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="text-center mb-5">
                            <h2 className="h3 fw-bold text-primary mb-3">Available Events</h2>
                            <p className="text-muted">Choose from our selection of amazing events</p>
                        </div>
                    </div>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading events...</p>
                    </div>
                )}

                {/* Events Grid */}
                {!loading && events.length === 0 && (
                    <div className="text-center my-5">
                        <div className="alert alert-info" role="alert">
                            <h4 className="alert-heading">No Events Available</h4>
                            <p>There are currently no events available for booking. Please check back later!</p>
                        </div>
                    </div>
                )}

                {!loading && events.length > 0 && (
                    <div className="row g-4 justify-content-center">
                        {events.map(event => {
                            const { date, time } = formatDate(event.date);
                            return (
                                <div key={event._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-12">
                                    <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title fw-bold text-primary mb-3">
                                                {event.name}
                                            </h5>
                                            
                                            <div className="mb-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="bi bi-calendar-event text-muted me-2"></i>
                                                    <small className="text-muted fw-semibold">Date & Time</small>
                                                </div>
                                                <p className="mb-1 fw-semibold">{date}</p>
                                                <p className="text-muted mb-0">{time}</p>
                                            </div>

                                            {event.location && (
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="bi bi-geo-alt text-muted me-2"></i>
                                                        <small className="text-muted fw-semibold">Location</small>
                                                    </div>
                                                    <p className="text-muted mb-0">{event.location}</p>
                                                </div>
                                            )}

                                            {event.description && (
                                                <div className="mb-3 flex-grow-1">
                                                    <p className="card-text text-muted small">
                                                        {event.description.length > 100 
                                                            ? `${event.description.substring(0, 100)}...` 
                                                            : event.description
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-auto">
                                                <Link 
                                                    to={`/event/${event._id}`}
                                                    className="btn btn-primary w-100 fw-semibold"
                                                >
                                                    View Details & Book
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-light mt-5 py-4">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <p className="text-muted mb-0">&copy; 2024 Event Booking. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Home;
