import axios from "axios";
import { useState } from "react";

export default function AdminLogin(){
  const [form, setForm] = useState({
  username: "",
  password: ""
});

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  function loginAdmin(){

    axios.post("http://localhost:5000/admin/login",{
      username,
      password
    })
    .then(res => {
        if(res.data.message === "success"){
            localStorage.setItem("adminToken",res.data.token);
            alert("Admin Login Successful");
            window.location = "/admin/dashboard";
        }
        else{
            alert("Invalid Credentials");
        }
    })
    .catch(err =>{
        console.log(err);
        alert("Backend Error");
    });

  }

  return(
    <div className="container mt-5" style={{maxWidth:"400px"}}>
      <h2>Admin Login</h2>

      <input 
        className="form-control mt-3"
        placeholder="Username"
        onChange={(e)=>setUsername(e.target.value)}
      />

      <input 
        type="password"
        className="form-control mt-3"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button 
        className="btn btn-primary mt-3 w-100"
        onClick={loginAdmin}>
        Login
      </button>
 
    </div>
  );
}
