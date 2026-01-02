import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import Booking from "./pages/Booking";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminPayments from "./pages/AdminPayments";

import Bookings from "./pages/Bookings";
import Navbar from "./components/Navbar";

import "./App.css";


// ================= USER ROUTE GUARDS =================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("userToken");
  return token ? children : <Navigate to="/login" />;
}

function GuestRoute({ children }) {
  const token = localStorage.getItem("userToken");
  return token ? <Navigate to="/rooms" /> : children;
}


// ================= ADMIN ROUTE GUARD =================
function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
}


// ================= MAIN APP =================
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />


        {/* USER PROTECTED ROUTES */}
        <Route path="/rooms" element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        }/>

        <Route path="/book/:id" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }/>

        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }/>


        {/* GUEST ONLY */}
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }/>

        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }/>


        {/* ================= ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }/>

        <Route path="/admin/bookings" element={
          <AdminProtectedRoute>
            <AdminBookings />
          </AdminProtectedRoute>
        }/>

        <Route path="/admin/payments" element={
          <AdminProtectedRoute>
            <AdminPayments />
          </AdminProtectedRoute>
        }/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
