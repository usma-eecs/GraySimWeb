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
import { motion } from "framer-motion";
import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <motion.div
      className="cpu-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="cpu-controls"
        style={{ justifyContent: "space-between", padding: "20px 40px" }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ color: "#fff", fontSize: "2rem", margin: 0 }}>DASHBOARD</h2>
      </motion.div>

      {/* Content */}
      <motion.div
        className="cpu-content"
        style={{ alignItems: "stretch" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Sidebar */}
        <motion.div
          className="cpu-process-table"
          style={{ minWidth: "220px" }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 style={{ textAlign: "left", color: "#fff" }}>Quick Links</h3>
          <div className="d-flex flex-column gap-3 mt-3">
            <Link to="/cpu-scheduling" className="side-btn">CPU Scheduling</Link>
            <Link to="/page-replacement" className="side-btn">Page Replacement</Link>
          </div>
        </motion.div>

        {/* Main */}
        <motion.div
          className="cpu-grid"
          style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div>
            <h3 style={{ color: "#fff", marginBottom: "20px" }}>Welcome, Cadet!</h3>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <StatCard title="Completed Simulations" value="4" delay={0.8} />
              <StatCard title="Correct Answers" value="3" delay={1.0} />
              <StatCard title="Last Login" value="Apr 22" delay={1.2} />
            </div>
          </div>

          <motion.div className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
            <h4 style={{ color: "#fff", marginBottom: "20px" }}>Quick Actions</h4>
            <div className="d-flex gap-3">
              <Link to="/cpu-scheduling" className="side-btn">Try CPU Simulation</Link>
              <Link to="/page-replacement" className="side-btn">Try Page Sim</Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="cpu-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        Use the links on the left to start simulating. Welcome to Gray Sim Web.
      </motion.div>
    </motion.div>
  );
};

// Stat card with animation
const StatCard = ({ title, value, delay }) => (
  <motion.div
    style={{
      backgroundColor: "#444",
      color: "white",
      borderRadius: "12px",
      padding: "20px",
      width: "200px",
      textAlign: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    }}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
  >
    <p className="text-muted">{title}</p>
    <h2>{value}</h2>
  </motion.div>
);

export default Dashboard;
