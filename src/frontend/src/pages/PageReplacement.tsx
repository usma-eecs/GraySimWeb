import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PagePolicy,
  PageProblem,
  getPageFeedback,
  getPagePolicy,
  getPageProblem,
  getPageSolution,
  resetPageProblem,
} from "../api/auth";
import "../styles/PageReplacement.css";

const policies: PagePolicy[] = ["FIFO", "LRU", "OPT", "CLOCK"];

const buildEmptyMemory = (frames: number, cols: number): string[][] =>
  Array.from({ length: frames }, () => Array.from({ length: cols }, () => "-"));

const PageReplacement = (): JSX.Element => {
  const userID = useMemo(() => localStorage.getItem("token") || "anonymous", []);
  const [selectedPolicy, setSelectedPolicy] = useState<PagePolicy>("FIFO");
  const [problem, setProblem] = useState<PageProblem | null>(null);
  const [studentMemory, setStudentMemory] = useState<string[][]>([]);
  const [solutionMemory, setSolutionMemory] = useState<string[][] | null>(null);
  const [message, setMessage] = useState("");

  const loadProblem = async (): Promise<void> => {
    try {
      const res = await getPageProblem(userID);
      const incoming = res.data?.problem as PageProblem;
      if (!incoming) throw new Error("No problem payload");
      setProblem(incoming);
      setStudentMemory(buildEmptyMemory(incoming.frameCount, incoming.referenceString.length));
      setSolutionMemory(null);
      setMessage("Loaded page replacement problem.");
    } catch {
      setMessage("Failed to load page replacement problem.");
    }
  };

  useEffect(() => {
    loadProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePolicyChange = async (policy: PagePolicy): Promise<void> => {
    setSelectedPolicy(policy);
    setSolutionMemory(null);
    try {
      const res = await getPagePolicy(userID, policy);
      setMessage(res.data?.msg || "Policy loaded.");
    } catch {
      setMessage("Could not load policy description.");
    }
  };

  const updateCell = (row: number, col: number, value: string): void => {
    const normalized = value.trim() === "" ? "-" : value.trim();
    setStudentMemory((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = normalized;
      return next;
    });
  };

  const handleShowPolicy = async (): Promise<void> => {
    try {
      const res = await getPagePolicy(userID, selectedPolicy);
      setMessage(res.data?.msg || "Policy details loaded.");
    } catch {
      setMessage("Error fetching policy description.");
    }
  };

  const handleShowFeedback = async (): Promise<void> => {
    try {
      const res = await getPageFeedback(userID, selectedPolicy, studentMemory);
      setMessage(`${res.data?.msg || "Feedback ready."} Score: ${res.data?.score ?? 0}%`);
    } catch {
      setMessage("Error getting feedback.");
    }
  };

  const handleShowSolution = async (): Promise<void> => {
    try {
      const res = await getPageSolution(userID, selectedPolicy);
      setSolutionMemory((res.data?.solution?.memory || null) as string[][] | null);
      setMessage(res.data?.msg || "Solution loaded.");
    } catch {
      setMessage("Error getting solution.");
    }
  };

  const handleReset = async (): Promise<void> => {
    try {
      const res = await resetPageProblem(userID);
      const incoming = res.data?.problem as PageProblem;
      if (!incoming) throw new Error("No problem payload");
      setProblem(incoming);
      setStudentMemory(buildEmptyMemory(incoming.frameCount, incoming.referenceString.length));
      setSolutionMemory(null);
      setMessage("Problem reset.");
    } catch {
      setMessage("Error resetting problem.");
    }
  };

  if (!problem) {
    return <div className="pr-container">Loading page replacement problem...</div>;
  }

  const columns = problem.referenceString.length;

  return (
    <motion.div
      className="pr-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <div className="pr-header">
        {policies.map((policy) => (
          <button
            key={policy}
            className={`pr-policy-btn ${selectedPolicy === policy ? "active" : ""}`}
            onClick={() => handlePolicyChange(policy)}
          >
            {policy}
          </button>
        ))}
      </div>

      <div className="pr-main">
        <div className="pr-left">
          <h3>Problem</h3>
          <p>
            Frames: <b>{problem.frameCount}</b>
          </p>
          <p>
            Active policy: <b>{selectedPolicy}</b>
          </p>
        </div>

        <div className="pr-grid-wrap">
          <div className="pr-grid" style={{ gridTemplateColumns: `90px repeat(${columns}, 1fr)` }}>
            <div className="pr-cell pr-head">Request</div>
            {problem.referenceString.map((p, idx) => (
              <div key={`req-${idx}`} className="pr-cell pr-head">
                {p}
              </div>
            ))}

            {Array.from({ length: problem.frameCount }).map((_, row) => (
              <React.Fragment key={`row-${row}`}>
                <div className="pr-cell pr-head">Frame {row + 1}</div>
                {Array.from({ length: columns }).map((__, col) => {
                  const solutionValue = solutionMemory?.[row]?.[col];
                  const isMatch = solutionValue && studentMemory[row]?.[col] === solutionValue;

                  return (
                    <input
                      key={`${row}-${col}`}
                      className={`pr-input ${isMatch ? "match" : ""}`}
                      value={studentMemory[row]?.[col] || "-"}
                      onChange={(e) => updateCell(row, col, e.target.value)}
                      maxLength={2}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {message && <div className="pr-message">{message}</div>}
        </div>

        <div className="pr-actions">
          <button className="pr-action-btn" onClick={handleShowPolicy}>
            Show Policy
          </button>
          <button className="pr-action-btn" onClick={handleShowFeedback}>
            Show Feedback
          </button>
          <button className="pr-action-btn" onClick={handleShowSolution}>
            Show Solution
          </button>
          <button className="pr-action-btn" onClick={handleReset}>
            Reset Problem
          </button>
          <button className="pr-action-btn" onClick={loadProblem}>
            Reload Problem
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PageReplacement;
