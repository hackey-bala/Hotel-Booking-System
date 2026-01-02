import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard(){

  const [rooms,setRooms] = useState([]);
  const [form,setForm] = useState({name:"",price:"",capacity:""});
  const [editId,setEditId] = useState(null);

  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  // LOAD ROOMS
  const loadRooms = ()=>{
    axios.get("http://localhost:5000/admin/rooms",{
      headers:{ Authorization:`Bearer ${token}` }
    })
    .then(res=>setRooms(res.data));
  };

  useEffect(()=>{ loadRooms(); },[]);


  const handleChange = e =>{
    setForm({...form,[e.target.name]:e.target.value});
  };


  // ADD ROOM
  const addRoom = ()=>{
    const fd = new FormData();
    fd.append("name",form.name);
    fd.append("price",form.price);
    fd.append("capacity",form.capacity);
    fd.append("image",form.image);

    axios.post("http://localhost:5000/admin/rooms",fd,{
      headers:{
        Authorization:`Bearer ${token}`,
        "Content-Type":"multipart/form-data"
      }
    })
    .then(()=>{
      alert("Room Added");
      setForm({name:"",price:"",capacity:"",image:null});
      loadRooms();
    });
  };


  // START EDIT
  const startEdit = room =>{
    setEditId(room.id);
    setForm({
      name:room.name,
      price:room.price,
      capacity:room.capacity
    });
  };


  // UPDATE ROOM
  const updateRoom = ()=>{

    const fd = new FormData();
    fd.append("name",form.name);
    fd.append("price",form.price);
    fd.append("capacity",form.capacity);

    if(form.image){
      fd.append("image",form.image);
    }

    axios.put(`http://localhost:5000/admin/rooms/${editId}`,fd,{
      headers:{
        Authorization:`Bearer ${token}`,
        "Content-Type":"multipart/form-data"
      }
    })
    .then(()=>{
      alert("Room Updated");
      setEditId(null);
      setForm({name:"",price:"",capacity:"",image:null});
      loadRooms();
    });
  };


  // DELETE ROOM
  const deleteRoom = id =>{
    if(!window.confirm("Delete Room?")) return;

    axios.delete(`http://localhost:5000/admin/rooms/${id}`,{
      headers:{ Authorization:`Bearer ${token}` }
    })
    .then(()=>{
      alert("Room Deleted");
      loadRooms();
    });
  };


  const logout = ()=>{
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };


  return(
    <>
      {/* ================= ADMIN HEADER ================= */}
      <div style={{background:"#1f2937",padding:"15px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        
        <h3>🏨 Admin Dashboard</h3>

        <div>
          <Link to="/admin/bookings" className="btn btn-warning mx-1">
            Booking Approvals
          </Link>

          <Link to="/admin/payments" className="btn btn-info mx-1">
            Payment Verification
          </Link>

          <button className="btn btn-danger mx-1" onClick={logout}>
            Logout
          </button>
        </div>
      </div>


      {/* ================= ROOMS ================= */}
      <div className="container mt-4">

        <h4>{editId ? "Edit Room" : "Add Room"}</h4>

        <input className="form-control mt-2" placeholder="Room Name"
          name="name" value={form.name} onChange={handleChange}/>

        <input className="form-control mt-2" placeholder="Price"
          name="price" value={form.price} onChange={handleChange}/>

        <input className="form-control mt-2" placeholder="Capacity"
          name="capacity" value={form.capacity} onChange={handleChange}/>

        <input type="file" className="form-control mt-2"
          onChange={e=>setForm({...form,image:e.target.files[0]})}
        />

        {editId ?
          <button className="btn btn-warning mt-2" onClick={updateRoom}>
            Update Room
          </button>
          :
          <button className="btn btn-success mt-2" onClick={addRoom}>
            Add Room
          </button>
        }

        <hr/>

        {/* ================= ROOMS TABLE ================= */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Room</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Available</th>
              <th>Action</th>
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
                    {r.available ? "Yes" : "No"}
                  </span>
                </td>

                <td>
                  <button className="btn btn-primary btn-sm mx-1"
                    onClick={()=>startEdit(r)}>
                    Edit
                  </button>

                  <button className="btn btn-danger btn-sm"
                    onClick={()=>deleteRoom(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </>
  );
}
