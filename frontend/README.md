# Event Booking Frontend

A modern, responsive ticket booking web application built with React, TypeScript, and Bootstrap 5.

## Features

### Home Page
- **Clean Header**: Navigation bar with app branding
- **Event Grid**: Responsive card layout displaying events
- **Event Cards**: Show event title, date, time, location, and description
- **Loading States**: Spinner and loading messages
- **Empty States**: User-friendly messages when no events are available
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens

### Event Detail Page
- **Event Information**: Detailed event header with date, time, and location
- **Seat Availability Table**: Bootstrap table showing sections, rows, and available seats
- **Interactive Booking Form**: 
  - Section dropdown (populated from API)
  - Row dropdown (filtered based on selected section)
  - Number input for tickets (with max validation)
- **Real-time Validation**: Form validation and availability checking
- **Booking Feedback**: Success/error alerts with Bootstrap styling
- **Group Discount**: Automatic detection and notification for 4+ tickets
- **Loading States**: Button spinners during booking process

## Design Features

### Bootstrap 5 Components Used
- **Navigation**: Responsive navbar with collapsible menu
- **Cards**: Event cards and content containers
- **Tables**: Seat availability display
- **Forms**: Booking form with dropdowns and inputs
- **Alerts**: Success, error, and info messages
- **Buttons**: Primary and outline styles with hover effects
- **Spinners**: Loading indicators
- **Badges**: Seat availability status

### Custom Styling
- **Modern Design**: Clean, professional appearance
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: Focus states and proper contrast
- **Visual Feedback**: Interactive elements with clear states

### Color Scheme
- **Primary**: Bootstrap blue (#0d6efd)
- **Background**: Light gray (#f8f9fa)
- **Text**: Dark gray (#495057)
- **Success**: Green for available seats
- **Danger**: Red for sold out seats

## Technical Implementation

### Dependencies
- React 19.1.1
- TypeScript
- Bootstrap 5.3.8
- Bootstrap Icons
- React Router DOM 7.8.2
- Axios for API calls

### File Structure
```
src/
├── pages/
│   ├── Home.tsx          # Home page with event grid
│   └── EventDetail.tsx   # Event detail and booking page
├── api/
│   └── event.ts          # API functions
├── styles/
│   └── custom.css        # Custom CSS enhancements
└── main.tsx              # App entry point
```

### Key Features
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error states and messages
- **Loading States**: User feedback during API calls
- **Form Validation**: Client-side validation with real-time feedback
- **Responsive Design**: Mobile-optimized layout
- **Accessibility**: ARIA labels and keyboard navigation

## Usage

1. **View Events**: Browse available events on the home page
2. **Select Event**: Click "View Details & Book" on any event card
3. **Choose Seats**: Select section and row from dropdowns
4. **Book Tickets**: Enter number of tickets and click "Book Tickets"
5. **Confirmation**: Receive success message and group discount notification (if applicable)

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`