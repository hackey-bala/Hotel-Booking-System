import React, { useState } from "react";
import { useEffect } from "react";

export default function Home(){



  const [dark,setDark] = useState(false);

  const goRooms = () =>{
    const token = localStorage.getItem("userToken");
    if(token){
      window.location = "/rooms";
    }else{
      alert("Please login first");
      window.location = "/login";
    }
  };

  return(
    <div style={{background:dark ? "#121212" : "#f8f9fa"}}>
    
    {/* DARK MODE BUTTON */}
    <div className="text-end p-3">
      <button className="btn btn-dark" onClick={()=>setDark(!dark)}>
        {dark ? "Light Mode" : "Dark Mode"}
      </button>
    </div>

    {/* HERO CAROUSEL */}
  {/* HERO SECTION */}
<div className="hero-section">

  <div className="overlay"></div>

  <div className="hero-content">
    <h1 className="hero-title">
      Luxury Seven Hills Hotel
    </h1>

    <p className="hero-subtitle">
      Experience world-class comfort, premium rooms &
      unforgettable hospitality
    </p>

    <button className="btn book-btn" onClick={goRooms}>
      Book Your Stay
    </button>
  </div>

</div>



    {/* SEARCH BAR */}
    <div className="container mt-5 glass-search p-4 text-center">
      <h2>Find Your Perfect Stay</h2>
      <div className="row mt-3">
        <div className="col-md-4">
          <input type="date" className="form-control"/>
        </div>
        <div className="col-md-4">
          <input type="date" className="form-control"/>
        </div>
        <div className="col-md-4">
          <button className="btn btn-primary w-100" onClick={goRooms}>
            Search Rooms
          </button>
        </div>
      </div>
    </div>


    {/* FEATURES */}
    <div className="container text-center py-5">
      <h2 className="fw-bold">Why Choose Us?</h2>
      <p className="text-muted">Premium hotel trusted by thousands</p>

      <div className="row mt-4">

        <div className="col-md-3 p-3">
          <div className="card p-3 shadow feature-card">
            ⭐ Luxury Rooms
          </div>
        </div>

        <div className="col-md-3 p-3">
          <div className="card p-3 shadow feature-card">
            🍽️ Restaurant
          </div>
        </div>

        <div className="col-md-3 p-3">
          <div className="card p-3 shadow feature-card">
            🏊 Swimming Pool
          </div>
        </div>

        <div className="col-md-3 p-3">
          <div className="card p-3 shadow feature-card">
            🛎️ 24/7 Support
          </div>
        </div>

      </div>
    </div>


    {/* TESTIMONIALS */}
    <div className="container py-5 text-center">
      <h2 className="fw-bold">What Our Guests Say</h2>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card p-3 shadow glass-box">
            ❤️ “Amazing stay! Rooms were clean and luxury”
            <h6>- Balaji</h6>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow glass-box">
            ⭐ “Best hotel experience ever!”
            <h6>- Leela</h6>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow glass-box">
            😊 “Excellent service and food”
            <h6>- Abinaya</h6>
          </div>
        </div>
      </div>
    </div>


    {/* FOOTER */}
    <div className="bg-dark text-white text-center p-3">
      © 2025 Luxury Seven Hills Hotel — All Rights Reserved
    </div>

    </div>
  );
}
