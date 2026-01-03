import axios from "axios";
import { useState } from "react";
import API_BASE_URL from "../config";
export default function Login(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  function login(){
    axios.post(`${API_BASE_URL}/login`,{
      email,
      password
    })
    .then(res => {

      if(res.data.message === "success"){

        localStorage.setItem("userToken",res.data.token);
        localStorage.setItem("userId",res.data.userId);
        localStorage.setItem("userName",res.data.name);

        alert("Login Successful");
        window.location = "/rooms";
      }
      else{
        alert("Invalid Email / Password");
      }
    })
    .catch(err =>{
      console.log(err);
      alert("Server Error");
    });
  }

  return(
    <div className="container mt-5" style={{maxWidth:"400px"}}>

      <h2>User Login</h2>

      <input 
        type="email"
        className="form-control mt-3"
        placeholder="Enter Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input 
        type="password"
        className="form-control mt-3"
        placeholder="Enter Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button className="btn btn-primary w-100 mt-3" onClick={login}>
        Login
      </button>

    </div>
  );
}
