import React, { useState } from "react";
import "../styles/CpuScheduling.css";

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
    Array(processes.length).fill(Array(10).fill(false))
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
      {/* Policy Bar */}
      <div className="cpu-controls">
        {policies.map((policy) => (
          <button
            key={policy}
            className={`policy-btn ${
              selectedPolicy === policy ? "active" : ""
            }`}
            onClick={() => setSelectedPolicy(policy)}
          >
            {policy}
          </button>
        ))}
      </div>

      {/* Main Content (stretches to fill space) */}
      <div className="cpu-content">
        {/* Left Table: Processes */}
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

        {/* Grid Area (fills leftover width) */}
        <div className="cpu-grid">
          {/* Time Row */}
          <div className="grid-row time-row">
            <div className="grid-header">Process</div>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="grid-time">
                {idx}
              </div>
            ))}
          </div>
          {/* Clickable Rows */}
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

        {/* Side Buttons */}
        <div className="side-buttons">
          <button className="side-btn">Show Policy</button>
          <button className="side-btn">Show Feedback</button>
          <button className="side-btn">Show Solution</button>
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
