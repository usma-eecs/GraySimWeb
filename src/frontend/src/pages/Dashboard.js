// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const Dashboard = () => {
//   const [inputText, setInputText] = useState("");
//   const [message, setResponseMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const jsonData = { rawString: inputText };

//     try {
//       const res = await axios.post("http://localhost:5000/test", jsonData);
//       setResponseMessage("Response: " + res.data.msg);
//     } catch (error) {
//       setResponseMessage("Error: " + (error.response?.data?.msg || "Server error"));
//     }
//   };

//   const startScalaServer = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/start-scala");
//       setResponseMessage(res.data.msg);
//     } catch (error) {
//       console.error("Error starting Scala:", error);
//     }
//   };

//   const stopScalaServer = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/stop-scala");
//       setResponseMessage(res.data.msg);
//     } catch (error) {
//       console.error("Error stopping Scala:", error);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h1>Welcome to Your Dashboard</h1>
//       <p>Type a message and send it to the backend:</p>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           placeholder="Type here..."
//           required
//         />
//         <button type="submit">Send</button>
//       </form>
//       {message && <p className="message mt-3">{message}</p>}
//       {/* <div className="mt-4">
//         <button id="startScala" onClick={startScalaServer}>
//           Start Scala Server
//         </button>
//         <button id="stopScala" onClick={stopScalaServer}>
//           Stop Scala Server
//         </button> */}
//       {/* </div> */}
//     </div>
//   );
// };

// export default Dashboard;

import React from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="cpu-container">
      {/* Top Header */}
      <div className="cpu-controls" style={{ justifyContent: 'space-between', padding: '20px 40px' }}>
        <h2 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>DASHBOARD</h2>
      </div>

      <div className="cpu-content" style={{ alignItems: 'stretch' }}>
        {/* Sidebar */}
        <div className="cpu-process-table" style={{ minWidth: '220px' }}>
          <h3 style={{ textAlign: 'left', color: '#fff' }}>Quick Links</h3>
          <div className="d-flex flex-column gap-3 mt-3">
            <Link to="/cpu-scheduling" className="side-btn">CPU Scheduling</Link>
            <Link to="/page-replacement" className="side-btn">Page Replacement</Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="cpu-grid" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>Welcome, Cadet!</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={cardStyle}>
                <p className="text-muted">Completed Simulations</p>
                <h2>4</h2>
              </div>
              <div style={cardStyle}>
                <p className="text-muted">Correct Answers</p>
                <h2>3</h2>
              </div>
              <div style={cardStyle}>
                <p className="text-muted">Last Login</p>
                <h2>Apr 22</h2>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h4 style={{ color: '#fff', marginBottom: '20px' }}>Quick Actions</h4>
            <div className="d-flex gap-3">
              <Link to="/cpu-scheduling" className="side-btn">Try CPU Simulation</Link>
              <Link to="/page-replacement" className="side-btn">Try Page Sim</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cpu-footer">
        Use the links on the left to start simulating. Welcome to Gray Sim Web.
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: '#444',
  color: 'white',
  borderRadius: '12px',
  padding: '20px',
  width: '200px',
  textAlign: 'center',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

export default Dashboard;