import axios from "axios";
import { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import API_BASE_URL from "../config";
export default function AdminPayments(){

  const [payments,setPayments] = useState([]);
  const [popup,setPopup] = useState(null);

  const token = localStorage.getItem("adminToken");

  const loadPayments = ()=>{
    axios.get(`${API_BASE_URL}/admin/payments`,{
      headers:{ Authorization:`Bearer ${token}` }
    })
    .then(res=>setPayments(res.data));
  };

  useEffect(()=>{ loadPayments(); },[]);

  const approve = (id)=>{
    axios.put(`${API_BASE_URL}/admin/payment/approve/${id}`,{},{
      headers:{ Authorization:`Bearer ${token}` }
    })
    .then(()=>{
      alert("Payment Approved");
      loadPayments();
    });
  };

  const reject = (id)=>{
    axios.put(`${API_BASE_URL}/admin/payment/reject/${id}`,{},{
      headers:{ Authorization:`Bearer ${token}` }
    })
    .then(()=>{
      alert("Payment Rejected");
      loadPayments();
    });
  };

  return(
    <>
      <AdminNavbar/>

      <div className="container">
        <h2>Payment Verification</h2>
        <hr/>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>User</th>
              <th>Room</th>
              <th>Transaction</th>
              <th>Proof</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map(p=>(
              <tr key={p.id}>
                <td>{p.userName}</td>
                <td>{p.roomName}</td>
                <td>{p.transactionId}</td>

                <td>
                  <button className="btn btn-primary btn-sm"
                    onClick={()=>setPopup(p.paymentProof)}>
                    View
                  </button>
                </td>

                <td>
                  <span className={
                    p.paymentStatus === "Paid"
                    ? "badge bg-success"
                    : p.paymentStatus === "Rejected"
                    ? "badge bg-danger"
                    : "badge bg-warning"
                  }>
                    {p.paymentStatus}
                  </span>
                </td>

                <td>
                  <button className="btn btn-success btn-sm mx-1"
                    onClick={()=>approve(p.id)}>
                    Approve
                  </button>

                  <button className="btn btn-danger btn-sm"
                    onClick={()=>reject(p.id)}>
                    Reject
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* Popup */}
        {popup && (
          <div className="popup-bg"
            style={{
              position:"fixed",
              top:0,left:0,
              width:"100%",height:"100%",
              background:"#000000aa",
              display:"flex",
              justifyContent:"center",
              alignItems:"center"
            }}
            onClick={()=>setPopup(null)}
          >
            <img
              src={`${API_BASE_URL}/payments/${popup}`}
              style={{maxHeight:"90%",borderRadius:"10px"}}
              alt="proof"
            />
          </div>
        )}

      </div>
    </>
  );
}
