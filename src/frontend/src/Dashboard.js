import React, { useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [inputText, setInputText] = useState("");
  const [message, setResponseMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jsonData = { rawString: inputText }; // Convert input to JSON

    try {
      const res = await axios.post("http://localhost:5000/test", jsonData);
      setResponseMessage("Response: " + res.data.msg); // ✅ Correctly gets success message
    } catch (error) {
      setResponseMessage("Error: " + (error.response?.data?.msg || "Server error")); // ✅ Handles error properly
    }
  };

  return (
    <div className="container mt-5">
      <h1>Welcome to Your Dashboard</h1>
      <p>Type a message and send it to the backend:</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here..."
          required
        />
        <button type="submit">Send</button>
      </form>
      {message && <p className="message mt-3">{message}</p>}
    </div>
  );
};

export default Dashboard;
