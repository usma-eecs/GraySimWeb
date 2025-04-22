// import React, { useState } from "react";
// import "../styles/CpuScheduling.css";

// const processes = [
//   { name: "A", start: 0, service: 5 },
//   { name: "B", start: 2, service: 2 },
//   { name: "C", start: 3, service: 1 },
//   { name: "D", start: 8, service: 2 },
// ];

// const policies = ["FIFO", "SJF", "STCF", "RR", "MLFQ"];

// const CpuScheduling = () => {
//   const [selectedPolicy, setSelectedPolicy] = useState("FIFO");
//   const [grid, setGrid] = useState(
//     Array(processes.length).fill(Array(10).fill(false))
//   );

//   const toggleCell = (row, col) => {
//     const newGrid = grid.map((r, rowIndex) =>
//       rowIndex === row
//         ? r.map((c, colIndex) => (colIndex === col ? !c : c))
//         : r
//     );
//     setGrid(newGrid);
//   };

//   return (
//     <div className="cpu-container">
//       {/* Policy Bar */}
//       <div className="cpu-controls">
//         {policies.map((policy) => (
//           <button
//             key={policy}
//             className={`policy-btn ${
//               selectedPolicy === policy ? "active" : ""
//             }`}
//             onClick={() => setSelectedPolicy(policy)}
//           >
//             {policy}
//           </button>
//         ))}
//       </div>

//       {/* Main Content (stretches to fill space) */}
//       <div className="cpu-content">
//         {/* Left Table: Processes */}
//         <div className="cpu-process-table">
//           <h3>Processes</h3>
//           <div className="table-header">
//             <span>Process</span>
//             <span>Start Time</span>
//             <span>Service Time</span>
//           </div>
//           {processes.map((p) => (
//             <div key={p.name} className="table-row">
//               <span>{p.name}</span>
//               <span>{p.start}</span>
//               <span>{p.service}</span>
//             </div>
//           ))}
//         </div>

//         {/* Grid Area (fills leftover width) */}
//         <div className="cpu-grid">
//           {/* Time Row */}
//           <div className="grid-row time-row">
//             <div className="grid-header">Process</div>
//             {Array.from({ length: 10 }).map((_, idx) => (
//               <div key={idx} className="grid-time">
//                 {idx}
//               </div>
//             ))}
//           </div>
//           {/* Clickable Rows */}
//           {processes.map((p, row) => (
//             <div key={p.name} className="grid-row">
//               <div className="grid-header">{p.name}</div>
//               {Array.from({ length: 10 }).map((_, col) => (
//                 <div
//                   key={`${row}-${col}`}
//                   className={`grid-cell ${grid[row][col] ? "selected" : ""}`}
//                   onClick={() => toggleCell(row, col)}
//                 />
//               ))}
//             </div>
//           ))}
//         </div>

//         {/* Side Buttons */}
//         <div className="side-buttons">
//           <button className="side-btn">Show Policy</button>
//           <button className="side-btn">Show Feedback</button>
//           <button className="side-btn">Show Solution</button>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="cpu-footer">
//         This scheduler view shows the <b>{selectedPolicy}</b> scheduling policy.
//       </div>
//     </div>
//   );
// };

// export default CpuScheduling;

import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/CpuScheduling.css";
import {
  getPolicy,
  getFeedback,
  getSolution,
  resetProblem,
  getProblem,
} from "../api/auth";

const processes = [
  { name: "A", start: 0, service: 5 },
  { name: "B", start: 2, service: 2 },
  { name: "C", start: 3, service: 1 },
  { name: "D", start: 8, service: 2 },
];

const policies = ["FIFO", "SJF", "STCF", "RR", "MLFQ"];

const CpuScheduling = () => {
  const [userID] = useState("exampleUser123");
  const [selectedPolicy, setSelectedPolicy] = useState("FIFO");
  const [grid, setGrid] = useState(
    Array(processes.length).fill(Array(10).fill(false))
  );
  const [message, setMessage] = useState("");

  const getStudentAnswer = () => {
    return grid.map((row) =>
      row.reduce((acc, val, colIndex) => {
        if (val) acc.push(colIndex);
        return acc;
      }, [])
    );
  };

  const handlePolicyChange = async (policy) => {
    setSelectedPolicy(policy);
    try {
      const res = await getPolicy(userID, policy);
      setMessage(res.data?.msg || JSON.stringify(res.data));
    } catch (error) {
      setMessage("Error fetching policy.");
    }
  };

  const toggleCell = (row, col) => {
    const newGrid = grid.map((r, rIdx) =>
      rIdx === row ? r.map((val, cIdx) => (cIdx === col ? !val : val)) : [...r]
    );
    setGrid(newGrid);
  };

  const handleShowPolicy = async () => {
    try {
      const res = await getPolicy(userID, selectedPolicy);
      setMessage(res.data?.msg || JSON.stringify(res.data));
    } catch (error) {
      setMessage("Error showing policy.");
    }
  };

  const handleShowFeedback = async () => {
    try {
      const studentAnswer = getStudentAnswer();
      const res = await getFeedback(userID, selectedPolicy, studentAnswer);
      setMessage(res.data?.msg || JSON.stringify(res.data));
    } catch (error) {
      setMessage("Error showing feedback.");
    }
  };

  const handleShowSolution = async () => {
    try {
      const studentAnswer = getStudentAnswer();
      const res = await getSolution(userID, selectedPolicy, studentAnswer);
      setMessage(res.data?.msg || JSON.stringify(res.data));
    } catch (error) {
      setMessage("Error showing solution.");
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetProblem(userID);
      setMessage(res.data?.msg || "Reset complete.");
    } catch (error) {
      setMessage("Error during reset.");
    }
  };

  const handleGetProblem = async () => {
    try {
      const res = await getProblem(userID);
      setMessage(res.data?.msg || "New problem fetched.");
    } catch (error) {
      setMessage("Error getting problem.");
    }
  };

  return (
    <motion.div
      className="cpu-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Policy Buttons */}
      <motion.div
        className="cpu-controls"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {policies.map((policy) => (
          <motion.button
            key={policy}
            className={`policy-btn ${selectedPolicy === policy ? "active" : ""}`}
            onClick={() => handlePolicyChange(policy)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {policy}
          </motion.button>
        ))}
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="cpu-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Process Table */}
        <motion.div
          className="cpu-process-table"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Processes</h3>
          <div className="table-header">
            <span>Process</span>
            <span>Start Time</span>
            <span>Service Time</span>
          </div>
          {processes.map((p) => (
            <div key={p.name} className="table-row">
              <span>{p.name}</span>
              <span>{p.start}</span>
              <span>{p.service}</span>
            </div>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          className="cpu-grid"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="grid-row time-row">
            <div className="grid-header">Process</div>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="grid-time">
                {idx}
              </div>
            ))}
          </div>
          {processes.map((p, row) => (
            <div key={p.name} className="grid-row">
              <div className="grid-header">{p.name}</div>
              {Array.from({ length: 10 }).map((_, col) => (
                <div
                  key={`${row}-${col}`}
                  className={`grid-cell ${grid[row][col] ? "selected" : ""}`}
                  onClick={() => toggleCell(row, col)}
                />
              ))}
            </div>
          ))}

          {/* Message Display */}
          {message && (
            <motion.div
              className="server-message-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p><b>Server says:</b> {message}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Side Buttons */}
        <motion.div
          className="side-buttons"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <button className="side-btn" onClick={handleShowPolicy}>Show Policy</button>
          <button className="side-btn" onClick={handleShowFeedback}>Show Feedback</button>
          <button className="side-btn" onClick={handleShowSolution}>Show Solution</button>
          <button className="side-btn" onClick={handleReset}>Reset</button>
          <button className="side-btn" onClick={handleGetProblem}>Get Problem</button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="cpu-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        This scheduler view shows the <b>{selectedPolicy}</b> scheduling policy.
      </motion.div>
    </motion.div>
  );
};

export default CpuScheduling;
