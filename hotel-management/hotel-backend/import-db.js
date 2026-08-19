const mysql = require("mysql2");
require("dotenv").config();

console.log("🔄 Connecting to Database:", process.env.DB_HOST || "localhost");

const isCloudDB = process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1";

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "defaultdb",
  port: Number(process.env.DB_PORT) || 3306,
  ssl: isCloudDB || process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

const queries = [
  // 1. Users Table
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 2. Admin Table
  `CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  )`,

  // 3. Rooms Table
  `CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    capacity INT DEFAULT 2,
    available TINYINT(1) DEFAULT 1,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // 4. Bookings Table
  `CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerName VARCHAR(255) NOT NULL,
    roomId INT NOT NULL,
    userId INT,
    checkIn DATE NOT NULL,
    checkOut DATE NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    paymentStatus ENUM('Not Paid', 'Pending', 'Paid', 'Rejected') DEFAULT 'Not Paid',
    paymentProof VARCHAR(255),
    transactionId VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  )`,

  // 5. Seed Admin Account
  `INSERT IGNORE INTO admin (username, password) VALUES ('admin', 'admin123')`,

  // 6. Seed Rooms
  `INSERT INTO rooms (name, description, price, capacity, available, image)
   SELECT 'Deluxe Ocean View Suite', 'Spacious luxury room with ocean view, king size bed and balcony.', 4500, 2, 1, NULL
   WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Deluxe Ocean View Suite')`,

  `INSERT INTO rooms (name, description, price, capacity, available, image)
   SELECT 'Executive Family Suite', 'Double king beds, attached living area and complimentary breakfast.', 7500, 4, 1, NULL
   WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Executive Family Suite')`,

  `INSERT INTO rooms (name, description, price, capacity, available, image)
   SELECT 'Standard Comfort Room', 'Cozy modern room with high-speed WiFi and air conditioning.', 2500, 2, 1, NULL
   WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Standard Comfort Room')`
];

db.connect(async (err) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1);
  }

  console.log("✅ Connected to Database successfully!");
  console.log("⏳ Initializing tables and sample data...");

  for (let i = 0; i < queries.length; i++) {
    try {
      await new Promise((resolve, reject) => {
        db.query(queries[i], (qErr) => {
          if (qErr) reject(qErr);
          else resolve();
        });
      });
    } catch (qErr) {
      console.error(`❌ Error on query #${i + 1}:`, qErr.message);
      db.end();
      process.exit(1);
    }
  }

  console.log("🎉 SUCCESS! All tables (users, admin, rooms, bookings) and sample rooms were created in your Aiven database!");
  db.end();
});
