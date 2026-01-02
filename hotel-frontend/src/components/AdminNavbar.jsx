import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <div className="p-3 bg-dark text-white">
      <h3>Admin Panel</h3>

      <Link to="/admin/dashboard" className="btn btn-light mx-1">
        Rooms
      </Link>

      <Link to="/admin/bookings" className="btn btn-warning mx-1">
        Bookings
      </Link>

      <Link to="/admin/payments" className="btn btn-success mx-1">
        Payments
      </Link>
    </div>
  );
}
