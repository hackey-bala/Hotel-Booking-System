const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const authAdmin = require("./authAdmin");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/payments", express.static("payments"));

/* ================= DB ================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Balaji@1",
  database: "hotel_db"
});

db.connect(err => {
  if (err) console.error(err);
  else console.log("MySQL Connected");
});

/* ================= MULTER ================= */
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname))
  })
});

const uploadPayment = multer({
  storage: multer.diskStorage({
    destination: "./payments",
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname))
  })
});

/* ================= USER ================= */
app.post("/register", (req,res)=>{
  const { name,email,password } = req.body;
  db.query(
    "INSERT INTO users(name,email,password) VALUES (?,?,?)",
    [name,email,password],
    err => err ? res.status(500).json(err) : res.json({message:"registered"})
  );
});

app.post("/login",(req,res)=>{
  const { email,password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email,password],
    (err,result)=>{
      if(result.length===0) return res.json({message:"failed"});
      const token = jwt.sign({id:result[0].id}, "secret123");
      res.json({message:"success", token, userId:result[0].id});
    }
  );
});

app.get("/rooms",(req,res)=>{
  db.query("SELECT * FROM rooms WHERE available=1",(e,r)=>res.json(r));
});

/* ================= BOOKINGS ================= */
app.post("/book",(req,res)=>{
  const { customerName,roomId,checkIn,checkOut,userId } = req.body;
  db.query(
    `INSERT INTO bookings
     (customerName,roomId,checkIn,checkOut,userId,status,paymentStatus)
     VALUES (?,?,?,?,?,'Pending','Not Paid')`,
    [customerName,roomId,checkIn,checkOut,userId],
    e=> e ? res.status(500).json(e) : res.json({message:"Booked"})
  );
});

app.get("/admin/bookings",authAdmin,(req,res)=>{
  db.query(
    `SELECT b.*, r.name roomName
     FROM bookings b JOIN rooms r ON b.roomId=r.id`,
    (e,r)=>res.json(r)
  );
});

app.put("/admin/approve/:id",authAdmin,(req,res)=>{
  db.query(
    "UPDATE bookings SET status='Approved' WHERE id=?",
    [req.params.id],
    ()=> {
      db.query(
        `UPDATE rooms r JOIN bookings b ON r.id=b.roomId
         SET r.available=0 WHERE b.id=?`,
        [req.params.id]
      );
      res.json({message:"Approved"});
    }
  );
});

app.put("/admin/reject/:id",authAdmin,(req,res)=>{
  db.query(
    "UPDATE bookings SET status='Rejected' WHERE id=?",
    [req.params.id],
    ()=> {
      db.query(
        `UPDATE rooms r JOIN bookings b ON r.id=b.roomId
         SET r.available=1 WHERE b.id=?`,
        [req.params.id]
      );
      res.json({message:"Rejected"});
    }
  );
});

/* ================= PAYMENTS ================= */
app.get("/admin/payments",authAdmin,(req,res)=>{
  db.query(
    `SELECT b.*, r.name roomName, u.name userName
     FROM bookings b
     JOIN rooms r ON b.roomId=r.id
     JOIN users u ON b.userId=u.id
     WHERE b.paymentStatus!='Not Paid'`,
    (e,r)=>res.json(r)
  );
});

app.put("/admin/payment/approve/:id",authAdmin,(req,res)=>{
  db.query(
    "UPDATE bookings SET paymentStatus='Paid' WHERE id=?",
    [req.params.id],
    ()=>res.json({message:"Payment Approved"})
  );
});

app.put("/admin/payment/reject/:id",authAdmin,(req,res)=>{
  db.query(
    "UPDATE bookings SET paymentStatus='Rejected' WHERE id=?",
    [req.params.id],
    ()=>res.json({message:"Payment Rejected"})
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log("Server running on", PORT));
