import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "../styles/CpuScheduling.css";
import {
  CpuProblem,
  CpuPolicy,
  getCpuFeedback,
  getCpuPolicy,
  getCpuProblem,
  getCpuSolution,
  resetCpuProblem,
} from "../api/auth";

const policies: CpuPolicy[] = ["FIFO", "SJF", "STCF", "RR", "MLFQ"];

const buildEmptyMatrix = (processes: CpuProblem["processes"], cols: number): string[][] => {
  return processes.map(() => Array.from({ length: cols }, () => "-"));
};

const CpuScheduling = (): JSX.Element => {
  const userID = useMemo(() => localStorage.getItem("token") || "anonymous", []);
  const [selectedPolicy, setSelectedPolicy] = useState<CpuPolicy>("FIFO");
  const [problem, setProblem] = useState<CpuProblem | null>(null);
  const [studentMatrix, setStudentMatrix] = useState<string[][]>([]);
  const [solutionMatrix, setSolutionMatrix] = useState<string[][] | null>(null);
  const [message, setMessage] = useState("");

  const processes = problem?.processes || [];
  const timelineLength = solutionMatrix?.[0]?.length || problem?.horizon || 0;
  const gridRowStyle = { gridTemplateColumns: `60px repeat(${timelineLength}, 1fr)` };

  const loadProblem = async (): Promise<void> => {
    try {
      const res = await getCpuProblem(userID);
      const incoming = res.data?.problem as CpuProblem;
      const horizon = incoming?.horizon || 0;
      const normalized = { ...incoming, horizon };
      setProblem(normalized);
      setStudentMatrix(buildEmptyMatrix(normalized.processes, horizon));
      setSolutionMatrix(null);
      setMessage("Loaded CPU scheduling problem.");
    } catch {
      setMessage("Failed to load problem.");
    }
  };

  useEffect(() => {
    loadProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePolicyChange = async (policy: CpuPolicy): Promise<void> => {
    setSelectedPolicy(policy);
    setSolutionMatrix(null);
    try {
      const res = await getCpuPolicy(userID, policy);
      setMessage(res.data?.msg || "Policy loaded.");
    } catch {
      setMessage("Error fetching policy description.");
    }
  };

  const toggleCell = (row: number, col: number): void => {
    setStudentMatrix((prev) => {
      const next = prev.map((r) => [...r]);
      const processId = processes[row]?.id;
      if (!processId) return prev;

      if (next[row][col] === processId) {
        next[row][col] = "-";
        return next;
      }

      for (let r = 0; r < next.length; r += 1) {
        next[r][col] = "-";
      }
      next[row][col] = processId;
      return next;
    });
  };

  const handleShowPolicy = async (): Promise<void> => {
    try {
      const res = await getCpuPolicy(userID, selectedPolicy);
      setMessage(res.data?.msg || "Policy details loaded.");
    } catch {
      setMessage("Error showing policy.");
    }
  };

  const handleShowFeedback = async (): Promise<void> => {
    try {
      const res = await getCpuFeedback(userID, selectedPolicy, studentMatrix);
      setMessage(`${res.data?.msg || "Feedback ready."} Score: ${res.data?.score ?? 0}%`);
    } catch {
      setMessage("Error getting feedback.");
    }
  };

  const handleShowSolution = async (): Promise<void> => {
    try {
      const res = await getCpuSolution(userID, selectedPolicy);
      setSolutionMatrix((res.data?.solution?.matrix || null) as string[][] | null);
      setMessage(res.data?.msg || "Solution loaded.");
    } catch {
      setMessage("Error loading solution.");
    }
  };

  const handleReset = async (): Promise<void> => {
    try {
      const res = await resetCpuProblem(userID);
      const incoming = res.data?.problem as CpuProblem;
      const horizon = incoming?.horizon || 0;
      const normalized = { ...incoming, horizon };
      setProblem(normalized);
      setStudentMatrix(buildEmptyMatrix(normalized.processes, horizon));
      setSolutionMatrix(null);
      setMessage("Problem reset.");
    } catch {
      setMessage("Error resetting problem.");
    }
  };

  if (!problem) {
    return <div className="cpu-container">Loading CPU problem...</div>;
  }

  return (
    <motion.div
      className="cpu-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
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
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
          >
            {policy}
          </motion.button>
        ))}
      </motion.div>

      <motion.div className="cpu-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="cpu-process-table">
          <h3>Processes</h3>
          <div className="table-header">
            <span>Process</span>
            <span>Start</span>
            <span>Burst</span>
          </div>
          {processes.map((p) => (
            <div key={p.id} className="table-row">
              <span>{p.id}</span>
              <span>{p.arrival}</span>
              <span>{p.burst}</span>
            </div>
          ))}
          <div className="table-row">
            <span>RR Quantum</span>
            <span>-</span>
            <span>{problem.quantum}</span>
          </div>
        </div>

        <div className="cpu-grid">
          <div className="grid-row time-row" style={gridRowStyle}>
            <div className="grid-header">Process</div>
            {Array.from({ length: timelineLength }).map((_, idx) => (
              <div key={idx} className="grid-time">
                {idx}
              </div>
            ))}
          </div>

          {processes.map((p, row) => (
            <div key={p.id} className="grid-row" style={gridRowStyle}>
              <div className="grid-header">{p.id}</div>
              {Array.from({ length: timelineLength }).map((_, col) => (
                <div
                  key={`${row}-${col}`}
                  className={`grid-cell ${studentMatrix[row]?.[col] === p.id ? "selected" : ""} ${
                    solutionMatrix?.[row]?.[col] === p.id ? "solution" : ""
                  }`}
                  onClick={() => toggleCell(row, col)}
                  title={solutionMatrix?.[row]?.[col] === p.id ? "Solution" : ""}
                />
              ))}
            </div>
          ))}

          {message && (
            <motion.div
              className="server-message-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>
                <b>Status:</b> {message}
              </p>
            </motion.div>
          )}
        </div>

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
          <button className="side-btn" onClick={handleReset}>
            Reset Problem
          </button>
          <button className="side-btn" onClick={loadProblem}>
            Reload Problem
          </button>
        </div>
      </motion.div>

      <motion.div className="cpu-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Active policy: <b>{selectedPolicy}</b>
      </motion.div>
    </motion.div>
  );
};

export default CpuScheduling;
