-- Hotel Booking System Database Schema

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Table
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- 3. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  capacity INT DEFAULT 2,
  available TINYINT(1) DEFAULT 1,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
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
);

-- Seed Default Admin Account (admin / admin123)
INSERT INTO admin (username, password) 
VALUES ('admin', 'admin123')
ON DUPLICATE KEY UPDATE username=username;

-- Seed Sample Rooms
INSERT INTO rooms (name, description, price, capacity, available, image) 
VALUES 
('Deluxe Ocean View Suite', 'Spacious luxury room with ocean view, king size bed and balcony.', 4500, 2, 1, NULL),
('Executive Family Suite', 'Double king beds, attached living area and complimentary breakfast.', 7500, 4, 1, NULL),
('Standard Comfort Room', 'Cozy modern room with high-speed WiFi and air conditioning.', 2500, 2, 1, NULL)
ON DUPLICATE KEY UPDATE name=name;
