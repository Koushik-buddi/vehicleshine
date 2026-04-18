# 🚗 VehicleShine — Premium Vehicle Wash & Detailing

A production-ready full-stack website for a premium vehicle wash and detailing service.

---

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | HTML5, CSS3 (custom properties, grid/flex), Vanilla JS |
| Backend  | Node.js + Express.js               |
| Storage  | JSON flat-file (`data/bookings.json`) |
| Fonts    | Cormorant Garamond + DM Sans + DM Mono (Google Fonts) |

---

## Project Structure

```
vehicleshine/
├── server.js            ← Express API server
├── package.json
├── data/
│   └── bookings.json    ← Auto-created on first run
└── public/
    └── index.html       ← Full SPA frontend
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

### 3. Open the app
```
http://localhostn:3000
```

---

## API Reference

### Public Endpoints

| Method | Route              | Description                    |
|--------|--------------------|--------------------------------|
| GET    | `/api/services`    | Returns full service catalogue |
| GET    | `/api/slots?date=` | Available time slots for date  |
| POST   | `/api/bookings`    | Create a new booking           |

#### POST `/api/bookings` — Request body
```json
{
  "name":        "Arjun Sharma",
  "phone":       "9876543210",
  "vehicleType": "car",
  "serviceId":   "c1",
  "date":        "2025-12-20",
  "timeSlot":    "10:00 AM"
}
```

### Admin Endpoints

| Method | Route                        | Description             |
|--------|------------------------------|-------------------------|
| POST   | `/api/admin/login`           | Admin authentication    |
| GET    | `/api/admin/bookings`        | Fetch all bookings      |
| DELETE | `/api/admin/bookings/:id`    | Delete a booking        |
| GET    | `/api/admin/stats`           | Dashboard statistics    |

All admin endpoints require the header:
```
x-admin-token: <base64-token>
```

---

## Admin Panel

1. Click **Admin Panel** in the navbar or footer.
2. Enter the admin password (default: `admin@123`).
3. View all bookings, stats dashboard, and delete entries.

### Change admin password

Set an environment variable before starting:
```bash
ADMIN_PASSWORD=YourStrongPassword node server.js
```

---

## Services & Pricing

### 🏍️ Bike Services
| Service                        | Price   | Duration |
|--------------------------------|---------|----------|
| Basic Wash                     | ₹149    | 30 min   |
| Premium Wash                   | ₹299    | 45 min   |
| Chain Cleaning & Lubrication   | ₹199    | 30 min   |
| Full Service                   | ₹599    | 90 min   |

### 🚗 Car Services
| Service                | Price   | Duration |
|------------------------|---------|----------|
| Exterior Foam Wash     | ₹399    | 45 min   |
| Interior Deep Cleaning | ₹699    | 2 hrs    |
| Steam Cleaning         | ₹899    | 2.5 hrs  |
| Underbody Wash         | ₹499    | 1 hr     |
| Full Detailing         | ₹1,999  | 4–5 hrs  |

---

## Features

### Customer Side
- ✅ Responsive luxury dark UI
- ✅ 4-step booking wizard (Vehicle → Service → Date/Time → Contact)
- ✅ Real-time slot availability check
- ✅ Instant booking confirmation with ID
- ✅ Services page with car/bike tab toggle

### Admin Panel
- ✅ Password-protected login (token stored in localStorage)
- ✅ Dashboard stats (total bookings, today's bookings, cars, bikes, revenue)
- ✅ Searchable/filterable bookings table
- ✅ Delete bookings with confirmation modal
- ✅ Auto-logout on invalid/expired token

---

## Environment Variables

| Variable         | Default     | Description          |
|------------------|-------------|----------------------|
| `PORT`           | `3000`      | Server port          |
| `ADMIN_PASSWORD` | `admin@123` | Admin panel password |

---

## License

MIT — Free to use and modify.
