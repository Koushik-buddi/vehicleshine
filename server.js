/**
 * VehicleShine — Premium Vehicle Wash & Detailing Service
 * Backend: Node.js + Express + JSON file storage
 */

const express = require("express");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ── Data helpers ────────────────────────────────────────────────────────────
const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
};

const readBookings = () => {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeBookings = (bookings) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
};

// ── Services catalogue ──────────────────────────────────────────────────────
const SERVICES = {
  bike: [
    {
      id: 'b1',
      name: 'Basic Wash',
      price: 149,
      duration: '30 min',
      description: 'Exterior rinse, foam wash, and precision hand-dry finish.',
      badge: null,
    },
    {
      id: 'b2',
      name: 'Premium Wash',
      price: 299,
      duration: '45 min',
      description: 'Full exterior detailing with shine wax and tyre dressing.',
      badge: 'Popular',
    },
    {
      id: 'b3',
      name: 'Chain Cleaning & Lubrication',
      price: 199,
      duration: '30 min',
      description: 'Professional chain degreasing, cleaning, and lubrication.',
      badge: null,
    },
    {
      id: 'b4',
      name: 'Full Service',
      price: 599,
      duration: '90 min',
      description: 'Complete wash, polish, chain service, tyre dressing & detailing.',
      badge: 'Best Value',
    },
  ],
  car: [
    {
      id: 'c1',
      name: 'Exterior Foam Wash',
      price: 399,
      duration: '45 min',
      description: 'Professional foam cannon wash with hand-dry and tyre shine.',
      badge: null,
    },
    {
      id: 'c2',
      name: 'Interior Deep Cleaning',
      price: 699,
      duration: '2 hrs',
      description: 'Full interior vacuum, wipe-down, glass cleaning & sanitization.',
      badge: 'Popular',
    },
    {
      id: 'c3',
      name: 'Steam Cleaning',
      price: 899,
      duration: '2.5 hrs',
      description: 'High-pressure steam sanitization for deep fabric and surface care.',
      badge: null,
    },
    {
      id: 'c4',
      name: 'Underbody Wash',
      price: 499,
      duration: '1 hr',
      description: 'High-pressure underbody flush for rust prevention and debris removal.',
      badge: null,
    },
    {
      id: 'c5',
      name: 'Full Detailing',
      price: 1999,
      duration: '4–5 hrs',
      description: 'Complete inside-out detailing, paint correction & ceramic coat sealant.',
      badge: 'Premium',
    },
  ],
};

// ── Time slots ──────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM',
  '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
];

// ── Public routes ───────────────────────────────────────────────────────────

/** GET /api/services — Return full service catalogue */
app.get('/api/services', (_req, res) => {
  res.json({ success: true, data: SERVICES });
});

/** GET /api/slots?date=YYYY-MM-DD — Return available slots for a date */
app.get('/api/slots', (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Provide a valid date (YYYY-MM-DD).' });
  }

  // Reject past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(date) < today) {
    return res.status(400).json({ error: 'Cannot book slots in the past.' });
  }

  const bookings = readBookings();
  const bookedSlots = bookings
    .filter((b) => b.date === date && b.status !== 'cancelled')
    .map((b) => b.timeSlot);

  const slots = TIME_SLOTS.map((slot) => ({
    slot,
    available: !bookedSlots.includes(slot),
  }));

  res.json({ success: true, date, slots });
});

/** POST /api/bookings — Create a new booking */
app.post('/api/bookings', (req, res) => {
  const { name, phone, vehicleType, serviceId, date, timeSlot } = req.body;

  // Validate required fields
  if (!name || !phone || !vehicleType || !serviceId || !date || !timeSlot) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Phone validation (10-digit Indian mobile)
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit phone number.' });
  }

  // Validate vehicle type
  if (!['bike', 'car'].includes(vehicleType)) {
    return res.status(400).json({ error: 'Invalid vehicle type.' });
  }

  // Validate service
  const service = SERVICES[vehicleType]?.find((s) => s.id === serviceId);
  if (!service) {
    return res.status(400).json({ error: 'Invalid service selection.' });
  }

  // Validate date (not in the past)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(date) < today) {
    return res.status(400).json({ error: 'Cannot book slots in the past.' });
  }

  // Validate time slot
  if (!TIME_SLOTS.includes(timeSlot)) {
    return res.status(400).json({ error: 'Invalid time slot.' });
  }

  const bookings = readBookings();

  // Check for slot conflict
  const conflict = bookings.find(
    (b) => b.date === date && b.timeSlot === timeSlot && b.status !== 'cancelled'
  );
  if (conflict) {
    return res
      .status(409)
      .json({ error: 'This slot is already booked. Please choose another time.' });
  }

  const booking = {
    id: uuidv4(),
    name: name.trim(),
    phone,
    vehicleType,
    serviceId: service.id,
    serviceName: service.name,
    servicePrice: service.price,
    serviceDuration: service.duration,
    date,
    timeSlot,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  writeBookings(bookings);

  console.log(`[BOOKING] New booking: ${booking.id} — ${booking.name} — ${booking.date} ${booking.timeSlot}`);

  res.status(201).json({ success: true, booking });
});

// ── Admin routes ────────────────────────────────────────────────────────────

/** POST /api/admin/login — Admin authentication */
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required.' });
  if (password === ADMIN_PASSWORD) {
    const token = Buffer.from(`${password}:vehicleshine`).toString('base64');
    return res.json({ success: true, token });
  }
  res.status(401).json({ error: 'Invalid password.' });
});

/** Admin middleware — validates token */
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    if (decoded === `${ADMIN_PASSWORD}:vehicleshine`) return next();
  } catch (_) {}
  res.status(401).json({ error: 'Invalid or expired token.' });
};

/** GET /api/admin/bookings — Fetch all bookings */
app.get('/api/admin/bookings', adminAuth, (req, res) => {
  const bookings = readBookings();
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ success: true, data: sorted, total: sorted.length });
});

/** DELETE /api/admin/bookings/:id — Delete a booking */
app.delete('/api/admin/bookings/:id', adminAuth, (req, res) => {
  const bookings = readBookings();
  const index = bookings.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found.' });
  const [removed] = bookings.splice(index, 1);
  writeBookings(bookings);
  console.log(`[ADMIN] Deleted booking: ${removed.id}`);
  res.json({ success: true, message: 'Booking deleted successfully.' });
});

/** GET /api/admin/stats — Dashboard stats */
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const bookings = readBookings();
  const today = new Date().toISOString().split('T')[0];
  res.json({
    success: true,
    stats: {
      total: bookings.length,
      today: bookings.filter((b) => b.date === today).length,
      bikes: bookings.filter((b) => b.vehicleType === 'bike').length,
      cars: bookings.filter((b) => b.vehicleType === 'car').length,
      revenue: bookings
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.servicePrice || 0), 0),
    },
  });
});

// ── Catch-all SPA route ─────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✨ VehicleShine server running → http://localhost:${PORT}`);
  console.log(`🔐 Admin password: ${ADMIN_PASSWORD}`);
  console.log(`📁 Data file: ${DATA_FILE}\n`);
});
