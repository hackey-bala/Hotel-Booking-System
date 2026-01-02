import axios from "axios";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PaymentUpload from "./PaymentUpload";

export default function Booking() {

  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [customerName, setName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/rooms")
      .then(res => {
        const r = res.data.find(x => x.id == id);
        setRoom(r);
      })
  }, []);

  function book() {

    if (!customerName || !checkIn || !checkOut)
      return alert("Fill all details");

    axios.post("http://localhost:5000/book", {
      customerName,
      roomId: id,
      checkIn,
      checkOut,
      userId: localStorage.getItem("userId")
    })
      .then(res => {
        alert("Booking Created, Now Upload Payment Screenshot");
        setBookingId(res.data.bookingId);
      })
  }

  if (!room) return <h3 className="text-center mt-5">Loading Room...</h3>;

  return (
    <div className="container mt-4">
      <h2>Book Room</h2>

      <h4>{room.name}</h4>
      <h5>₹{room.price}</h5>

      <input
        className="form-control mt-2"
        placeholder="Your Name"
        onChange={(e) => setName(e.target.value)}
      />

      <label className="mt-3">Check In</label>
      <input type="date" className="form-control"
        onChange={(e) => setCheckIn(e.target.value)}
      />

      <label className="mt-3">Check Out</label>
      <input type="date" className="form-control"
        onChange={(e) => setCheckOut(e.target.value)}
      />

      <button className="btn btn-success mt-3 w-100"
        onClick={book}>
        Confirm Booking
      </button>

      {/* PAYMENT UPLOAD SECTION */}
      {bookingId && (
        <PaymentUpload bookingId={bookingId} />
      )}

    </div>
  );
}
