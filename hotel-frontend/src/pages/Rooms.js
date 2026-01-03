import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config";
export default function Rooms() {

  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const token = localStorage.getItem("userToken");

  // LOAD ROOMS
  const loadRooms = () => {
    axios.get(`${API_BASE_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setRooms(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    loadRooms();
  }, []);


  // FILTER
  const filterRooms = () => {
    axios.get(`${API_BASE_URL}/filter-rooms`, {
      params: {
        search,
        min,
        max
      },
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setRooms(res.data))
      .catch(err => console.log(err));
  };


  return (
    <div className="container mt-4">

      <h2>Available Rooms</h2>
      <hr />


      {/* ================= FILTERS ================= */}
      <div className="row mb-3">

        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            className="form-control"
            type="number"
            placeholder="Min Price"
            value={min}
            onChange={e => setMin(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            className="form-control"
            type="number"
            placeholder="Max Price"
            value={max}
            onChange={e => setMax(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button className="btn btn-primary w-100"
            onClick={filterRooms}>
            Filter
          </button>
        </div>

        <div className="col-md-2">
          <button className="btn btn-secondary w-100"
            onClick={loadRooms}>
            Reset
          </button>
        </div>

      </div>



      {/* ================= ROOMS ================= */}
      <div className="row">

        {rooms.length === 0 && (
          <h4 className="text-center text-danger">
            No rooms found
          </h4>
        )}

        {rooms.map(r => (
          <div className="col-md-4 mt-3" key={r.id}>
            <div className="card shadow">

              {/* IMAGE */}
              {r.image && (
                <img
                  src={`${API_BASE_URL}/uploads/${r.image}`}
                  className="card-img-top"
                  height="200"
                  alt="room"
                />
              )}

              <div className="card-body">

                <h5>{r.name}</h5>

                <p className="mb-1">
                  <b>Price:</b> ₹{r.price}
                </p>

                <p className="mb-1">
                  <b>Capacity:</b> {r.capacity} persons
                </p>

                <span className={`badge ${r.available ? "bg-success" : "bg-danger"}`}>
                  {r.available ? "Available" : "Not Available"}
                </span>

                <br />

                {r.available ? (
                  <Link
                    to={`/book/${r.id}`}
                    className="btn btn-primary w-100 mt-2"
                  >
                    Book Now
                  </Link>
                ) : (
                  <button className="btn btn-secondary w-100 mt-2" disabled>
                    Not Available
                  </button>
                )}

              </div>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}
