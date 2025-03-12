import React, { useState } from "react";
import "./CpuScheduling.css"; // Style file

const processes = [
  { name: "A", start: 0, service: 5 },
  { name: "B", start: 2, service: 2 },
  { name: "C", start: 3, service: 1 },
  { name: "D", start: 8, service: 2 },
];

const policies = ["FIFO", "SJF", "STCF", "RR", "MLFQ"];

const CpuScheduling = () => {
  const [selectedPolicy, setSelectedPolicy] = useState("FIFO");
  const [grid, setGrid] = useState(
    Array(processes.length).fill(Array(10).fill(false)) // 4 rows x 10 columns
  );

  const toggleCell = (row, col) => {
    const newGrid = grid.map((r, rowIndex) =>
      rowIndex === row
        ? r.map((c, colIndex) => (colIndex === col ? !c : c))
        : r
    );
    setGrid(newGrid);
  };

  return (
    <div className="cpu-container">
      {/* Controls (Policy Selection) */}
      <div className="cpu-controls">
        {policies.map((policy) => (
          <button
            key={policy}
            className={`policy-btn ${selectedPolicy === policy ? "active" : ""}`}
            onClick={() => setSelectedPolicy(policy)}
          >
            {policy}
          </button>
        ))}
      </div>

      <div className="cpu-content">
        {/* Left Table (Processes, Start Time, Service Time) */}
        <div className="cpu-process-table">
          <div className="table-header">
            <div className="table-cell">Process</div>
            <div className="table-cell">Start Time</div>
            <div className="table-cell">Service Time</div>
          </div>
          {processes.map((process, index) => (
            <div key={process.name} className="table-row">
              <div className="table-cell">{process.name}</div>
              <div className="table-cell">{process.start}</div>
              <div className="table-cell">{process.service}</div>
            </div>
          ))}
        </div>

        {/* Main Scheduling Grid */}
        <div className="cpu-grid">
          {/* Time Row */}
          <div className="time-row">
            <div className="grid-header">Process</div>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="grid-time">
                {index}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {processes.map((process, row) => (
            <div key={process.name} className="grid-row">
              <div className="grid-header">{process.name}</div>
              {Array.from({ length: 10 }).map((_, col) => (
                <div
                  key={`${row}-${col}`}
                  className={`grid-cell ${grid[row][col] ? "selected" : ""}`}
                  onClick={() => toggleCell(row, col)}
                ></div>
              ))}
            </div>
          ))}
        </div>

        {/* Side Buttons */}
        <div className="side-buttons">
          <button className="side-btn">Show Policy</button>
          <button className="side-btn">Show Feedback</button>
          <button className="side-btn">Show Solution</button>
        </div>
      </div>

      {/* Bottom Description */}
      <div className="cpu-footer">
        This scheduler view shows the {selectedPolicy} scheduling policy.
      </div>
    </div>
  );
};

export default CpuScheduling;
