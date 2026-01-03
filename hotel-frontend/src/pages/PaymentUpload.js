import axios from "axios";
import { useState } from "react";
import API_BASE_URL from "../config";
export default function PaymentUpload({ bookingId }) {

  const [image, setImage] = useState(null);

  function upload() {

    if (!image) return alert("Upload Screenshot");

    const fd = new FormData();
    fd.append("payment", image);

    axios.post(
      `${API_BASE_URL}/upload-payment/${bookingId}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then(() => {
      alert("Payment Uploaded, Waiting for Admin Approval");
      window.location = "/bookings";
    });
  }

  return (
    <div className="card p-3 mt-4">
      <h4>Upload Payment Screenshot</h4>

      <input type="file"
        className="form-control mt-2"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button className="btn btn-warning mt-2"
        onClick={upload}>
        Submit Payment
      </button>
    </div>
  );
}
