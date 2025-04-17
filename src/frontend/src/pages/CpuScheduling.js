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
  const [userID] = useState("exampleUser123"); // Example user ID
  const [selectedPolicy, setSelectedPolicy] = useState("FIFO");
  const [serverResponse, setServerResponse] = useState("");
  const [grid, setGrid] = useState(
    Array(processes.length).fill(Array(10).fill(false))
  );


  // Convert grid toggles to a simple data structure
  const getStudentAnswer = () => {
    // e.g. array of arrays of selected columns
    return grid.map((row) =>
      row.reduce((acc, val, colIndex) => {
        if (val) acc.push(colIndex);
        return acc;
      }, [])
    );
  };

  // 1) Handle Policy Changes
  const handlePolicyChange = async (policy) => {
    setSelectedPolicy(policy);
    try {
      const res = await getPolicy(userID, policy);
      console.log("getPolicy response:", res.data);
    } catch (error) {
      console.error("Error fetching policy:", error);
    }
  };

  // 2) Toggle Grid Cell
  const toggleCell = (row, col) => {
    const newGrid = grid.map((r, rIdx) =>
      rIdx === row ? r.map((val, cIdx) => (cIdx === col ? !val : val)) : [...r]
    );
    setGrid(newGrid);
  };
  

  // 3) Show Policy
  const handleShowPolicy = async () => {
    try {
      const res = await getPolicy(userID, selectedPolicy);
      console.log("Show Policy:", res.data);
    } catch (error) {
      console.error("Error in showPolicy:", error);
    }
  };

  // 4) Show Feedback
  const handleShowFeedback = async () => {
    try {
      const studentAnswer = getStudentAnswer();
      const res = await getFeedback(userID, selectedPolicy, studentAnswer);
      console.log("Show Feedback:", res.data);
    } catch (error) {
      console.error("Error in showFeedback:", error);
    }
  };

  // 5) Show Solution
  const handleShowSolution = async () => {
    try {
      const studentAnswer = getStudentAnswer();
      const res = await getSolution(userID, selectedPolicy, studentAnswer);
      console.log("Show Solution:", res.data);
    } catch (error) {
      console.error("Error in showSolution:", error);
    }
  };

  // (Optional) Reset or Get Problem
  const handleReset = async () => {
    try {
      const res = await resetProblem(userID);
      console.log("Reset response:", res.data);
    } catch (error) {
      console.error("Error in reset:", error);
    }
  };

  const handleGetProblem = async () => {
    try {
      const res = await getProblem(userID);
      console.log("Get Problem:", res.data);
      // Possibly update processes
    } catch (error) {
      console.error("Error in getProblem:", error);
    }
  };

  return (
    <div className="cpu-container">
      {/* Top Policy Buttons */}
      <div className="cpu-controls">
        {policies.map((policy) => (
          <button
            key={policy}
            className={`policy-btn ${selectedPolicy === policy ? "active" : ""}`}
            onClick={() => handlePolicyChange(policy)}
          >
            {policy}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="cpu-content">
        {/* Left: Process Table */}
        <div className="cpu-process-table">
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
        </div>

        {/* Middle: Grid */}
        <div className="cpu-grid">
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
        </div>

        {/* Right: Side Buttons */}
        <div className="side-buttons">
          <button className="side-btn" onClick={handleShowPolicy}>
            Show Policy
          </button>
          <button className="side-btn" onClick={handleShowFeedback}>
            Show Feedback
          </button>
          <button className="side-btn" onClick={handleShowSolution}>
            Show Solution
          </button>
          {/* Optional Buttons */}
          <button className="side-btn" onClick={handleReset}>
            Reset
          </button>
          <button className="side-btn" onClick={handleGetProblem}>
            Get Problem
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="cpu-footer">
        This scheduler view shows the <b>{selectedPolicy}</b> scheduling policy.
      </div>
    </div>
  );
};

export default CpuScheduling;
