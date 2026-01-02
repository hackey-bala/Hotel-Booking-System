import { useState } from "react";
import axios from "axios";

export default function Register(){

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  function registerUser(){

    axios.post("http://localhost:5000/register",{
        name,
        email,
        password
    })
    .then(res=>{
        if(res.data.message === "registered"){
            alert("Registration Successful");
            window.location = "/login";
        }else if(res.data.message === "email_exists"){
            alert("Email Already Registered");
        }
    })
    .catch(err=>console.log(err));
  }

  return(
    <div className="container mt-5" style={{maxWidth:"400px"}}>

      <h2>User Registration</h2>

      <input 
        className="form-control mt-3"
        placeholder="Name"
        onChange={(e)=>setName(e.target.value)}
      />

      <input 
        className="form-control mt-3"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input 
        type="password"
        className="form-control mt-3"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button 
        className="btn btn-success mt-3 w-100"
        onClick={registerUser}>
        Register
      </button>

    </div>
  );
}
