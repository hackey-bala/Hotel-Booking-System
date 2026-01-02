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
  if (err) console.log("DB Error", err);
  else console.log("MySQL Connected");
});

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const payStorage = multer.diskStorage({
  destination: "./payments",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const uploadPayment = multer({ storage: payStorage });

/* ================= USER ================= */

// REGISTER
app.post("/register", (req,res)=>{
  const { name,email,password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], (err,result)=>{
    if(result.length>0) return res.json({message:"email_exists"});

    db.query(
      "INSERT INTO users(name,email,password) VALUES (?,?,?)",
      [name,email,password],
      err=>{
        if(err) return res.json({message:"error"});
        res.json({message:"registered"});
      }
    );
  });
});

// LOGIN
app.post("/login",(req,res)=>{
  const { email,password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email,password],
    (err,result)=>{
      if(err) return res.send(err);

      if(result.length>0){
        const token = jwt.sign(
          { id: result[0].id, email },
          "secret123"
        );

        res.json({
          message:"success",
          token,
          userId: result[0].id,
          name: result[0].name
        });
      } else res.json({message:"failed"});
    }
  );
});

// USER ROOMS
app.get("/rooms",(req,res)=>{
  db.query("SELECT * FROM rooms WHERE available=1",(err,result)=>{
    if(err) res.send(err);
    else res.json(result);
  });
});

/* ================= BOOKING ================= */

// USER BOOK
// USER SEND BOOK REQUEST
app.post("/book", (req, res) => {
  const { customerName, roomId, checkIn, checkOut, userId } = req.body;

  const sql = `
    INSERT INTO bookings
    (customerName, roomId, checkIn, checkOut, userId, status, paymentStatus)
    VALUES (?, ?, ?, ?, ?, 'Pending', 'Not Paid')
  `;

  db.query(sql, [customerName, roomId, checkIn, checkOut, userId], err => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Booking Request Sent" });
  });
});

// USER BOOKING HISTORY
app.get("/user/bookings/:userId",(req,res)=>{
  db.query(
`SELECT b.*,r.name AS roomName,r.image
 FROM bookings b
 JOIN rooms r ON b.roomId=r.id
 WHERE b.userId=?`,
 [req.params.userId],
 (err,result)=> res.json(result)
 );
});

// CANCEL BOOKING
app.put("/cancel-booking/:id",(req,res)=>{
  const id = req.params.id;

  db.query("UPDATE bookings SET status='Cancelled' WHERE id=?",[id]);

  db.query(
`UPDATE rooms r 
 JOIN bookings b ON b.roomId=r.id
 SET r.available=1
 WHERE b.id=?`,
[id]);

  res.json({message:"Booking Cancelled & Room Released"});
});

/* ================= PAYMENT ================= */

app.post("/payment/upload", uploadPayment.single("proof"), (req,res)=>{
  const { bookingId,transactionId } = req.body;
  const file = req.file ? req.file.filename : null;

  db.query(
"UPDATE bookings SET transactionId=?, paymentProof=?, paymentStatus='Pending Verification' WHERE id=?",
[transactionId,file,bookingId],
err=>{
  if(err) return res.status(500).json(err);
  res.json({message:"Payment Submitted"});
});
});

/* ================= ADMIN ================= */

// LOGIN
import axios from "axios";
import { useState } from "react";

export default function AdminLogin(){
  const [form, setForm] = useState({
  username: "",
  password: ""
});

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  function loginAdmin(){

    axios.post("http://localhost:5000/admin/login",{
      username,
      password
    })
    .then(res => {
        if(res.data.message === "success"){
            localStorage.setItem("adminToken",res.data.token);
            alert("Admin Login Successful");
            window.location = "/admin/dashboard";
        }
        else{
            alert("Invalid Credentials");
        }
    })
    .catch(err =>{
        console.log(err);
        alert("Backend Error");
    });

  }

  return(
    <div className="container mt-5" style={{maxWidth:"400px"}}>
      <h2>Admin Login</h2>

      <input 
        className="form-control mt-3"
        placeholder="Username"
        onChange={(e)=>setUsername(e.target.value)}
      />

      <input 
        type="password"
        className="form-control mt-3"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button 
        className="btn btn-primary mt-3 w-100"
        onClick={loginAdmin}>
        Login
      </button>
 
    </div>
  );
}


// ALL BOOKINGS
app.get("/admin/bookings",(req,res)=>{
  db.query(
`SELECT b.*,r.name AS roomName 
 FROM bookings b
 JOIN rooms r ON b.roomId=r.id`,
 (err,result)=>res.json(result)
 );
});

// ROOMS
import axios from "axios";
import { useEffect, useState } from "react";

export default function AdminDashboard(){

  const [rooms,setRooms] = useState([]);
  const [bookings,setBookings] = useState([]);
  const [payments,setPayments] = useState([]);

  const token = localStorage.getItem("adminToken");


  // LOAD ROOMS
  const loadRooms = ()=>{
    axios.get("http://localhost:5000/admin/rooms",{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(res => setRooms(res.data))
    .catch(()=>alert("Rooms load failed"));
  };


  // LOAD BOOKINGS
  const loadBookings = ()=>{
    axios.get("http://localhost:5000/admin/bookings",{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(res => setBookings(res.data))
    .catch(()=>alert("Bookings load failed"));
  };


  // LOAD PAYMENTS (same API because payment info comes with bookings)
  const loadPayments = ()=>{
    axios.get("http://localhost:5000/admin/bookings",{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(res => setPayments(res.data))
    .catch(()=>alert("Payments load failed"));
  };


  useEffect(()=>{
    loadRooms();
    loadBookings();
    loadPayments();
  },[]);


  // APPROVE BOOKING
  const approveBooking = (id)=>{
    axios.put(`http://localhost:5000/admin/approve/${id}`,{},{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(()=>{
      alert("Booking Approved");
      loadBookings();
      loadRooms();
    });
  };


  // REJECT BOOKING
  const rejectBooking = (id)=>{
    if(!window.confirm("Reject booking?")) return;

    axios.put(`http://localhost:5000/admin/reject/${id}`,{},{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(()=>{
      alert("Booking Rejected & Room Released");
      loadBookings();
      loadRooms();
    });
  };


  // APPROVE PAYMENT
  const approvePayment = (id)=>{
    axios.put(`http://localhost:5000/admin/payment/approve/${id}`,{},{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(()=>{
      alert("Payment Approved");
      loadPayments();
      loadBookings();
    });
  };


  // REJECT PAYMENT
  const rejectPayment = (id)=>{
    if(!window.confirm("Reject payment?")) return;

    axios.put(`http://localhost:5000/admin/payment/reject/${id}`,{},{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(()=>{
      alert("Payment Rejected");
      loadPayments();
      loadBookings();
    });
  };


  return(
    <div className="container mt-4">

      <h2>Admin Dashboard</h2>


      {/* ================= ROOMS ================= */}
      <h3>Rooms</h3>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {rooms.map(r=>(
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.price}</td>
              <td>{r.capacity}</td>
              <td>
                <span className={`badge ${r.available? "bg-success":"bg-danger"}`}>
                  {r.available ? "Available" : "Booked"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* ================= BOOKINGS ================= */}
      <hr/>
      <h3>Bookings</h3>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Room</th>
            <th>Dates</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map(b=>(
            <tr key={b.id}>
              <td>{b.customerName}</td>
              <td>{b.roomName}</td>
              <td>{b.checkIn} → {b.checkOut}</td>

              <td>
                <span className={
                  b.status === "Approved"
                  ? "badge bg-success"
                  : b.status === "Rejected"
                  ? "badge bg-danger"
                  : "badge bg-warning"
                }>
                  {b.status}
                </span>
              </td>

              <td>
                <span className={
                  b.paymentStatus === "Paid"
                  ? "badge bg-success"
                  : b.paymentStatus === "Rejected"
                  ? "badge bg-danger"
                  : "badge bg-secondary"
                }>
                  {b.paymentStatus}
                </span>
              </td>

              <td>
                {b.status === "Pending" ? (
                  <>
                    <button className="btn btn-success btn-sm mx-1"
                      onClick={()=>approveBooking(b.id)}>
                      Approve
                    </button>

                    <button className="btn btn-danger btn-sm"
                      onClick={()=>rejectBooking(b.id)}>
                      Reject
                    </button>
                  </>
                ) : "—"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>



      {/* ================= PAYMENTS ================= */}
      <hr/>
      <h3>Payments</h3>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>User</th>
            <th>Room</th>
            <th>Transaction</th>
            <th>Proof</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {payments.map(p=>(
            <tr key={p.id}>
              <td>{p.customerName}</td>
              <td>{p.roomName}</td>
              <td>{p.transactionId || "—"}</td>

              <td>
                {p.paymentProof ? (
                  <a
                    href={`http://localhost:5000/payments/${p.paymentProof}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm">
                    View
                  </a>
                ) : "No File"}
              </td>

              <td>
                <span className={
                  p.paymentStatus === "Paid"
                  ? "badge bg-success"
                  : p.paymentStatus === "Rejected"
                  ? "badge bg-danger"
                  : "badge bg-warning"
                }>
                  {p.paymentStatus}
                </span>
              </td>

              <td>
                {p.paymentStatus === "Pending Verification" ? (
                  <>
                    <button
                      className="btn btn-success btn-sm mx-1"
                      onClick={()=>approvePayment(p.id)}>
                      Approve
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={()=>rejectPayment(p.id)}>
                      Reject
                    </button>
                  </>
                ) : "—"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

/* APPROVE BOOKING */
// USER SEND BOOK REQUEST
app.post("/book", (req, res) => {
  const { customerName, roomId, checkIn, checkOut, userId } = req.body;

  const sql = `
    INSERT INTO bookings
    (customerName, roomId, checkIn, checkOut, userId, status, paymentStatus)
    VALUES (?, ?, ?, ?, ?, 'Pending', 'Not Paid')
  `;

  db.query(sql, [customerName, roomId, checkIn, checkOut, userId], err => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Booking Request Sent" });
  });
});
app.put("/admin/approve/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "UPDATE bookings SET status='Approved' WHERE id=?",
    [id],
    err => {
      if (err) return res.status(500).json(err);

      db.query(
        `UPDATE rooms r
         JOIN bookings b ON b.roomId = r.id
         SET r.available = 0
         WHERE b.id = ?`,
        [id]
      );

      res.json({ message: "Booking Approved & Room Locked" });
    }
  );
});
app.put("/admin/rooms/:id", authAdmin, upload.single("image"), (req,res)=>{

  const { name, price, capacity } = req.body;
  const image = req.file ? req.file.filename : null;
  const id = req.params.id;

  let sql = "UPDATE rooms SET name=?, price=?, capacity=?";
  let params = [name, price, capacity];

  if(image){
    sql += ", image=?";
    params.push(image);
  }

  sql += " WHERE id=?";
  params.push(id);

  db.query(sql, params,(err)=>{
    if(err) return res.status(500).json(err);
    res.json({message:"Room Updated"});
  });

});

/* REJECT BOOKING */
app.put("/admin/reject/:id",(req,res)=>{
  const id = req.params.id;

  db.query(
"UPDATE bookings SET status='Rejected', paymentStatus='Rejected' WHERE id=?",
[id],
err=>{
  if(err) return res.status(500).json(err);

  db.query(
`UPDATE rooms r
 JOIN bookings b ON b.roomId=r.id
 SET r.available=1
 WHERE b.id=?`,
[id]
);

  res.json({message:"Booking Rejected & Room Released"});
});
});

/* DELETE BOOKING */
app.delete("/admin/bookings/:id",(req,res)=>{
  const bookingId = req.params.id;

  db.query(
`UPDATE rooms r
 JOIN bookings b ON b.roomId=r.id
 SET r.available=1
 WHERE b.id=?`,
[bookingId],
err=>{
  if(err) return res.status(500).json(err);

  db.query(
"DELETE FROM bookings WHERE id=?",
[bookingId],
err2=>{
  if(err2) return res.status(500).json(err2);

  res.json({message:"Booking Deleted & Room Released"});
});
});
});

/* ================= ADMIN PAYMENTS ================= */

app.get("/admin/payments", (req,res)=>{
  db.query(
    `SELECT b.*, r.name AS roomName, u.name AS userName
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     JOIN users u ON b.userId = u.id
     WHERE b.paymentStatus != 'Not Paid'`,
    (err,result)=>{
      if(err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

app.put("/admin/payment/approve/:id",(req,res)=>{
  db.query(
    "UPDATE bookings SET paymentStatus='Paid' WHERE id=?",
    [req.params.id],
    err=>{
      if(err) return res.status(500).json(err);
      res.json({message:"Payment Approved"});
    }
  );
});

app.put("/admin/payment/reject/:id",(req,res)=>{
  db.query(
    "UPDATE bookings SET paymentStatus='Rejected' WHERE id=?",
    [req.params.id],
    err=>{
      if(err) return res.status(500).json(err);
      res.json({message:"Payment Rejected"});
    }
  );
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

