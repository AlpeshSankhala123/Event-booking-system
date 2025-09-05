Practical Submission – Event Ticket Booking System

This document highlights what was implemented and provides clear steps to run and test the project end‑to‑end.

What’s Implemented (Highlights)
- Backend REST APIs (Node.js + Express + MongoDB):
  - POST `/api/events` – Create an event with sections and rows
  - GET `/api/events` – List events (basic info)
  - GET `/api/events/:id/availability` – Section/row availability with total, booked, and available seats
  - POST `/api/events/:id/purchase` – Purchase by quantity with atomic overbooking prevention
- Data Model:
  - Event → Sections → Rows with `totalSeats` and `bookedSeats` (and optional `bookedIndices` field already supported)
- Concurrency Safety:
  - Atomic compare‑and‑set update to prevent overbooking (works on standalone MongoDB, no replica set required)
- Frontend (React + Vite):
  - Home page: event list and a 50/50 hero with an image carousel
  - Event detail page: availability table, booking form (section/row/quantity), success/failure UI, group‑discount notice (≥4 tickets)
  - Create Event page: form to add events (sections and rows)
- UX Enhancements:
  - SweetAlert2 toast notifications for booking success/failure

Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection string for a remote instance)

Environment Variables
- Backend
  - `MONGO_URI` (optional) – defaults to `mongodb://127.0.0.1:27017/ticketDB`
  - `PORT` (optional) – defaults to `5000`

How to Run
1) Install dependencies
   - Backend
     ```bash
     cd back-end
     npm install
     ```
   - Frontend
     ```bash
     cd ../frontend
     npm install
     ```

2) Start services (in two terminals)
   - Backend (terminal A)
     ```bash
     cd back-end
     npm run dev
     ```
   - Frontend (terminal B)
     ```bash
     cd frontend
     npm run dev
     ```

3) Create a sample event (use Postman/curl)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Concert XYZ",
    "date": "2025-07-10T19:00:00Z",
    "sections": [
      {
        "name": "Section A",
        "rows": [
          { "name": "Row 1", "totalSeats": 10 },
          { "name": "Row 2", "totalSeats": 8 }
        ]
      },
      {
        "name": "Section B",
        "rows": [ { "name": "Row 1", "totalSeats": 6 } ]
      }
    ]
  }'
```

4) Use the UI
- Open the frontend URL shown by Vite (e.g., `http://localhost:5173`).
- Home page → “View Details & Book” → select section, row, quantity → Book.
- Success/failure toasts will appear at the top; availability refreshes automatically.

Key API Endpoints (for quick reference)
- Create Event
  - POST `http://localhost:5000/api/events`
- List Events
  - GET `http://localhost:5000/api/events`
- Availability
  - GET `http://localhost:5000/api/events/:id/availability`
- Purchase Tickets (by quantity)
  - POST `http://localhost:5000/api/events/:id/purchase`
  - Body: `{ "sectionName": "Section A", "rowName": "Row 1", "quantity": 2 }`

Notes & Assumptions
- Booking is quantity‑based (event‑style). The backend also supports specific seat indices if needed in future.
- Overbooking is prevented using an atomic conditional update (CAS) compatible with standalone MongoDB.
- UI uses Bootstrap; no heavy UI kit.

Where to Look in Code
- Backend
  - `back-end/src/controllers/eventController.ts` – all API handlers
  - `back-end/src/model/event.ts` – Mongoose schemas
  - `back-end/src/routes/eventRoutes.ts` – routes
  - `back-end/src/config/dbConnection.ts` – DB connection
- Frontend
  - `frontend/src/pages/Home.tsx` – hero + event list
  - `frontend/src/pages/EventDetail.tsx` – availability + booking
  - `frontend/src/pages/CreateEvent.tsx` – create event form
  - `frontend/src/api/event.ts` – API helpers

Optional Next Steps (if time allows)
- Unit tests for backend booking logic
- Real‑time updates with WebSockets
- Docker Compose for one‑command startup


