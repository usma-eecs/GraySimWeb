import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [inputText, setInputText] = useState("");
  const [message, setResponseMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jsonData = { rawString: inputText };

    try {
      const res = await axios.post("http://localhost:5000/test", jsonData);
      setResponseMessage("Response: " + res.data.msg);
    } catch (error) {
      setResponseMessage("Error: " + (error.response?.data?.msg || "Server error"));
    }
  };

  const startScalaServer = async () => {
    try {
      const res = await axios.post("http://localhost:5000/start-scala");
      setResponseMessage(res.data.msg);
    } catch (error) {
      console.error("Error starting Scala:", error);
    }
  };

  const stopScalaServer = async () => {
    try {
      const res = await axios.post("http://localhost:5000/stop-scala");
      setResponseMessage(res.data.msg);
    } catch (error) {
      console.error("Error stopping Scala:", error);
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
      {/* <div className="mt-4">
        <button id="startScala" onClick={startScalaServer}>
          Start Scala Server
        </button>
        <button id="stopScala" onClick={stopScalaServer}>
          Stop Scala Server
        </button> */}
      {/* </div> */}
    </div>
  );
};

export default Dashboard;
