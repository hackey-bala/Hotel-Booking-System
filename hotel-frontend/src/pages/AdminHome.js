import AdminNavbar from "../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

export default function AdminHome(){

  const navigate = useNavigate();

  return (
    <>
      <AdminNavbar/>

      <div className="container mt-5">

        <h2 className="mb-4 fw-bold">Admin Control Center</h2>

        <div className="row">

          <div className="col-md-4">
            <div className="card shadow p-4">
              <h4>Room Management</h4>
              <p>Add / Edit / Delete Rooms</p>
              <button className="btn btn-dark" 
                onClick={()=>navigate("/admin/dashboard")}>
                Manage Rooms
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow p-4">
              <h4>Booking Approval</h4>
              <p>Approve or Reject bookings</p>
              <button className="btn btn-warning"
                onClick={()=>navigate("/admin/bookings")}>
                Manage Bookings
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow p-4">
              <h4>Payment Verification</h4>
              <p>Approve or Reject Payments</p>
              <button className="btn btn-info"
                onClick={()=>navigate("/admin/payments")}>
                Manage Payments
              </button>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
