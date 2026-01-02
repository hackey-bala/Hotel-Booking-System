import React from "react";

function Navbar(){
  const name = localStorage.getItem("userName");
  const isLoggedIn = localStorage.getItem("userToken");

  function logout(){
    localStorage.removeItem("userToken");
    alert("Logged Out");
    window.location = "/";
  }

  return(
    <nav className="navbar navbar-dark bg-dark px-4">
      <h2 className="text-white">🏨 Hotel Seven Hills</h2>

      <div>

        <a href="/" className="btn btn-light mx-2">Home</a>

        <a href="/rooms" className="btn btn-warning mx-2">Rooms</a>

        <a href="/admin/login" className="btn btn-info mx-2">Admin</a>


        {/* IF NOT LOGGED IN */}
        {!isLoggedIn && (
          <>
            <a href="/login" className="btn btn-primary mx-2">Login</a>
            <a href="/register" className="btn btn-success mx-2">Register</a>
          </>
        )}

        {/* IF LOGGED IN */}
        {isLoggedIn && (
          <>
            <a href="/bookings" className="btn btn-warning mx-2">
              My Bookings
            </a>
            <span className="text-white mx-3">
    👤 Welcome, {name}
  </span>
            <button className="btn btn-danger mx-2" onClick={logout}>
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
