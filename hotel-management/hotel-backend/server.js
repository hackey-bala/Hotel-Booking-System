const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authAdmin = require("./authAdmin");
const authUser = require("./authUser");
require("dotenv").config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "uploads");
const paymentDir = path.join(__dirname, "payments");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(paymentDir)) fs.mkdirSync(paymentDir, { recursive: true });

// Static file serving
app.use("/uploads", express.static(uploadDir));
app.use("/payments", express.static(paymentDir));

/* ================= DATABASE CONNECTION POOL ================= */
const isCloudDB = process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "defaultdb",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isCloudDB || process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

// Test DB Connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("⚠️ MySQL Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully via Pool");
    connection.release();
  }
});

/* ================= MULTER CONFIGURATION ================= */
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
    }
  })
});

const uploadPayment = multer({
  storage: multer.diskStorage({
    destination: paymentDir,
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
    }
  })
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

/* ================= USER AUTHENTICATION ================= */
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if email already exists
  db.query("SELECT id FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length > 0) {
      return res.json({ message: "email_exists" });
    }

    // Insert user
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      (insertErr) => {
        if (insertErr) return res.status(500).json({ error: insertErr.message });
        return res.json({ message: "registered" });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) {
        return res.json({ message: "failed" });
      }

      const user = result[0];
      const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        message: "success",
        token,
        userId: user.id,
        name: user.name
      });
    }
  );
});

/* ================= ROOMS (PUBLIC & USER) ================= */
// Get all available rooms
app.get("/rooms", (req, res) => {
  db.query("SELECT * FROM rooms WHERE available = 1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Filter & search rooms
app.get("/filter-rooms", (req, res) => {
  const { search, min, max } = req.query;
  let sql = "SELECT * FROM rooms WHERE available = 1";
  const params = [];

  if (search && search.trim() !== "") {
    sql += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  if (min && min !== "") {
    sql += " AND price >= ?";
    params.push(Number(min));
  }

  if (max && max !== "") {
    sql += " AND price <= ?";
    params.push(Number(max));
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/* ================= BOOKINGS (USER) ================= */
// Create a new booking
app.post("/book", (req, res) => {
  const { customerName, roomId, checkIn, checkOut, userId } = req.body;
  if (!customerName || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    `INSERT INTO bookings (customerName, roomId, checkIn, checkOut, userId, status, paymentStatus)
     VALUES (?, ?, ?, ?, ?, 'Pending', 'Not Paid')`,
    [customerName, roomId, checkIn, checkOut, userId || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        message: "Booked",
        bookingId: result.insertId
      });
    }
  );
});

// Get bookings for a specific user
app.get("/user/bookings/:userId", (req, res) => {
  const { userId } = req.params;
  db.query(
    `SELECT b.*, r.name AS roomName, r.price AS roomPrice, r.image AS roomImage
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     WHERE b.userId = ?
     ORDER BY b.id DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Cancel a booking by user
app.put("/cancel-booking/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE bookings SET status = 'Cancelled' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Release the room if it was locked
      db.query(
        `UPDATE rooms r JOIN bookings b ON r.id = b.roomId
         SET r.available = 1 WHERE b.id = ?`,
        [id],
        () => {
          res.json({ message: "Booking cancelled successfully" });
        }
      );
    }
  );
});

// Upload payment proof screenshot
app.post("/upload-payment/:id", uploadPayment.single("payment"), (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No payment file uploaded" });
  }

  const filename = req.file.filename;
  db.query(
    "UPDATE bookings SET paymentProof = ?, paymentStatus = 'Pending' WHERE id = ?",
    [filename, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Payment proof uploaded", filename });
    }
  );
});

/* ================= ADMIN AUTHENTICATION ================= */
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  db.query(
    "SELECT * FROM admin WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.length === 0) {
        return res.json({ message: "failed" });
      }

      const token = jwt.sign(
        { id: result[0].id, username: result[0].username, role: "admin" },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "success",
        token
      });
    }
  );
});

/* ================= ADMIN ROOM MANAGEMENT ================= */
// Get all rooms (available & unavailable)
app.get("/admin/rooms", authAdmin, (req, res) => {
  db.query("SELECT * FROM rooms ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new room
app.post("/admin/rooms", authAdmin, upload.single("image"), (req, res) => {
  const { name, price, capacity } = req.body;
  const image = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO rooms (name, price, capacity, image, available) VALUES (?, ?, ?, ?, 1)",
    [name, price, capacity || 2, image],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Room added successfully", id: result.insertId });
    }
  );
});

// Update an existing room
app.put("/admin/rooms/:id", authAdmin, upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, price, capacity } = req.body;

  if (req.file) {
    const image = req.file.filename;
    db.query(
      "UPDATE rooms SET name = ?, price = ?, capacity = ?, image = ? WHERE id = ?",
      [name, price, capacity, image, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Room updated successfully" });
      }
    );
  } else {
    db.query(
      "UPDATE rooms SET name = ?, price = ?, capacity = ? WHERE id = ?",
      [name, price, capacity, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Room updated successfully" });
      }
    );
  }
});

// Delete a room
app.delete("/admin/rooms/:id", authAdmin, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM rooms WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Room deleted successfully" });
  });
});

/* ================= ADMIN BOOKINGS MANAGEMENT ================= */
// Get all bookings
app.get("/admin/bookings", authAdmin, (req, res) => {
  db.query(
    `SELECT b.*, r.name AS roomName, u.name AS userName, u.email AS userEmail
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     LEFT JOIN users u ON b.userId = u.id
     ORDER BY b.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Approve booking (locks the room)
app.put("/admin/approve/:id", authAdmin, (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE bookings SET status = 'Approved' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(
        `UPDATE rooms r JOIN bookings b ON r.id = b.roomId
         SET r.available = 0 WHERE b.id = ?`,
        [id],
        () => res.json({ message: "Approved" })
      );
    }
  );
});

// Reject booking (releases the room)
app.put("/admin/reject/:id", authAdmin, (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE bookings SET status = 'Rejected' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(
        `UPDATE rooms r JOIN bookings b ON r.id = b.roomId
         SET r.available = 1 WHERE b.id = ?`,
        [id],
        () => res.json({ message: "Rejected" })
      );
    }
  );
});

// Delete a booking
app.delete("/admin/bookings/:id", authAdmin, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM bookings WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Booking deleted successfully" });
  });
});

/* ================= ADMIN PAYMENTS MANAGEMENT ================= */
// Get all payment submissions
app.get("/admin/payments", authAdmin, (req, res) => {
  db.query(
    `SELECT b.*, r.name AS roomName, u.name AS userName
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     LEFT JOIN users u ON b.userId = u.id
     WHERE b.paymentStatus != 'Not Paid' OR b.paymentProof IS NOT NULL
     ORDER BY b.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Approve payment
app.put("/admin/payment/approve/:id", authAdmin, (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE bookings SET paymentStatus = 'Paid' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Payment Approved" });
    }
  );
});

// Reject payment
app.put("/admin/payment/reject/:id", authAdmin, (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE bookings SET paymentStatus = 'Rejected' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Payment Rejected" });
    }
  );
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Hotel Backend Server running on port ${PORT}`);
});
