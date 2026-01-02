import axios from "axios";
import { useEffect, useState } from "react";

export default function Bookings() {

  const [bookings, setBookings] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    axios.get(`http://localhost:5000/user/bookings/${userId}`)
      .then(res => {
        console.log("BOOKINGS RESPONSE:", res.data);

        if (Array.isArray(res.data)) {
          setBookings(res.data);
        } else {
          setBookings([]);   // prevent crash
        }

        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setBookings([]);
        setLoading(false);
      });

  }, []);

  function cancelBooking(id){
    axios.put(`http://localhost:5000/cancel-booking/${id}`)
    .then(()=>{
      alert("Booking Cancelled");
      window.location.reload();
    })
  }

  if (loading) return <h3 className="text-center mt-5">Loading...</h3>;

  return (
    <div className="container mt-4">
      <h2>My Bookings</h2>

      {bookings.length === 0 ? (
        <h4 className="text-center text-danger mt-4">
          No bookings found
        </h4>
      ) : (

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Room</th>
            <th>CheckIn</th>
            <th>CheckOut</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.roomName}</td>
              <td>{new Date(b.checkIn).toLocaleDateString()}</td>
              <td>{new Date(b.checkOut).toLocaleDateString()}</td>
              <td>{b.status}</td>

              <td>
                <span className={`badge ${
                  b.paymentStatus === "Paid"
                    ? "bg-success"
                    : b.paymentStatus === "Rejected"
                    ? "bg-danger"
                    : "bg-warning"
                }`}>
                  {b.paymentStatus || "Pending"}
                </span>
              </td>

              <td>
                {b.status === "Booked" ? (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => cancelBooking(b.id)}
                  >
                    Cancel
                  </button>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}
