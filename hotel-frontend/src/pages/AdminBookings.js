import axios from "axios";
import { useEffect, useState } from "react";

export default function AdminBookings(){

  const [bookings,setBookings] = useState([]);
  const token = localStorage.getItem("adminToken");


  const loadBookings = ()=>{
    axios.get("http://localhost:5000/admin/bookings",{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(res => setBookings(res.data))
    .catch(err => console.log(err));
  };

  useEffect(()=>{ loadBookings(); },[]);



  // APPROVE BOOKING
  const approveBooking = (id)=>{
    axios.put(`http://localhost:5000/admin/approve/${id}`,{},{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(()=>{
      alert("Booking Approved & Room Locked");
      loadBookings();
    });
  };


  // REJECT BOOKING
  const rejectBooking = (id)=>{
    if(!window.confirm("Reject Booking?")) return;

    axios.put(`http://localhost:5000/admin/reject/${id}`,{},{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(()=>{
      alert("Booking Rejected & Room Released");
      loadBookings();
    });
  };


  // DELETE BOOKING
  const deleteBooking = (id)=>{
    if(!window.confirm("Delete booking permanently?")) return;

    axios.delete(`http://localhost:5000/admin/bookings/${id}`,{
      headers:{ Authorization: `Bearer ${token}` }
    })
    .then(()=>{
      alert("Booking Deleted & Room Released");
      loadBookings();
    })
    .catch(err=>console.log(err));
  };


  return(
    <div className="container mt-4">

      <h2>Admin — Manage Bookings</h2>
      <hr/>

      <table className="table table-bordered table-striped">
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

              <td>
                {b.checkIn} → {b.checkOut}
              </td>

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

                {/* Pending Bookings → Show Approve / Reject */}
                {b.status === "Pending" && (
                  <>
                    <button
                      className="btn btn-success btn-sm mx-1"
                      onClick={()=>approveBooking(b.id)}>
                      Approve
                    </button>

                    <button
                      className="btn btn-danger btn-sm mx-1"
                      onClick={()=>rejectBooking(b.id)}>
                      Reject
                    </button>
                  </>
                )}

                {/* Delete Always Available */}
                <button
                  className="btn btn-dark btn-sm"
                  onClick={()=>deleteBooking(b.id)}>
                  Delete
                </button>

                {b.status !== "Pending" && " "}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
