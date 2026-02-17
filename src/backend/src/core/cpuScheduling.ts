import {
  CpuFeedbackResult,
  CpuPolicy,
  CpuPolicyResult,
  CpuProblem,
  CpuProcess,
} from "../types";

const PROCESS_IDS = ["A", "B", "C", "D", "E", "F"];

const policyDescriptions: Record<CpuPolicy, string> = {
  FIFO:
    "First In, First Out: when the running process finishes, choose the ready process that arrived first.",
  SJF:
    "Shortest Job First: choose the ready process with the shortest total burst. Non-preemptive.",
  STCF:
    "Shortest Time-to-Completion First: always run the ready process with the smallest remaining time. Preemptive.",
  RR: "Round Robin: rotate through ready processes using a fixed time quantum.",
  MLFQ:
    "Multi-Level Feedback Queue: highest-priority queue runs first; jobs demote as they consume CPU quanta.",
};

interface SimProc extends CpuProcess {
  remaining: number;
}

const cloneProcesses = (processes: CpuProcess[]): SimProc[] =>
  processes.map((p) => ({ ...p, remaining: p.burst }));

const cmpArrivalThenId = (a: CpuProcess, b: CpuProcess): number => {
  if (a.arrival !== b.arrival) return a.arrival - b.arrival;
  return a.id.localeCompare(b.id);
};

const allDone = (procs: SimProc[]): boolean => procs.every((p) => p.remaining <= 0);

const buildMatrix = (processes: CpuProcess[], timeline: string[]): string[][] => {
  return processes.map((p) =>
    timeline.map((running) => (running === p.id ? p.id : "-"))
  );
};

const fifo = (processes: CpuProcess[]): string[] => {
  const procs = cloneProcesses(processes).sort(cmpArrivalThenId);
  const timeline: string[] = [];
  const ready: SimProc[] = [];
  let t = 0;
  let idx = 0;

  while (!allDone(procs)) {
    while (idx < procs.length && procs[idx].arrival <= t) {
      ready.push(procs[idx]);
      idx += 1;
    }

    if (ready.length === 0) {
      timeline.push("-");
      t += 1;
      continue;
    }

    const current = ready.shift()!;
    while (current.remaining > 0) {
      timeline.push(current.id);
      current.remaining -= 1;
      t += 1;
      while (idx < procs.length && procs[idx].arrival <= t) {
        ready.push(procs[idx]);
        idx += 1;
      }
    }
  }

  return timeline;
};

const sjf = (processes: CpuProcess[]): string[] => {
  const procs = cloneProcesses(processes).sort(cmpArrivalThenId);
  const timeline: string[] = [];
  const ready: SimProc[] = [];
  let t = 0;
  let idx = 0;

  while (!allDone(procs)) {
    while (idx < procs.length && procs[idx].arrival <= t) {
      ready.push(procs[idx]);
      idx += 1;
    }

    if (ready.length === 0) {
      timeline.push("-");
      t += 1;
      continue;
    }

    ready.sort((a, b) => {
      if (a.burst !== b.burst) return a.burst - b.burst;
      return cmpArrivalThenId(a, b);
    });

    const current = ready.shift()!;
    while (current.remaining > 0) {
      timeline.push(current.id);
      current.remaining -= 1;
      t += 1;
      while (idx < procs.length && procs[idx].arrival <= t) {
        ready.push(procs[idx]);
        idx += 1;
      }
    }
  }

  return timeline;
};

const stcf = (processes: CpuProcess[]): string[] => {
  const procs = cloneProcesses(processes).sort(cmpArrivalThenId);
  const timeline: string[] = [];
  let t = 0;

  while (!allDone(procs)) {
    const ready = procs
      .filter((p) => p.arrival <= t && p.remaining > 0)
      .sort((a, b) => {
        if (a.remaining !== b.remaining) return a.remaining - b.remaining;
        return cmpArrivalThenId(a, b);
      });

    if (ready.length === 0) {
      timeline.push("-");
      t += 1;
      continue;
    }

    const current = ready[0];
    current.remaining -= 1;
    timeline.push(current.id);
    t += 1;
  }

  return timeline;
};

const rr = (processes: CpuProcess[], quantum: number): string[] => {
  const procs = cloneProcesses(processes).sort(cmpArrivalThenId);
  const timeline: string[] = [];
  const queue: SimProc[] = [];
  let t = 0;
  let idx = 0;

  const enqueueArrivals = (): void => {
    while (idx < procs.length && procs[idx].arrival <= t) {
      queue.push(procs[idx]);
      idx += 1;
    }
  };

  while (!allDone(procs)) {
    enqueueArrivals();

    if (queue.length === 0) {
      timeline.push("-");
      t += 1;
      continue;
    }

    const current = queue.shift()!;
    const slice = Math.min(quantum, current.remaining);

    for (let i = 0; i < slice; i += 1) {
      timeline.push(current.id);
      current.remaining -= 1;
      t += 1;
      enqueueArrivals();
      if (current.remaining <= 0) break;
    }

    if (current.remaining > 0) {
      queue.push(current);
    }
  }

  return timeline;
};

const mlfq = (processes: CpuProcess[]): string[] => {
  const procs = cloneProcesses(processes).sort(cmpArrivalThenId);
  const timeline: string[] = [];
  const queues: SimProc[][] = [[], [], []];
  const quanta = [1, 2, 4];
  let t = 0;
  let idx = 0;

  const enqueueArrivals = (): void => {
    while (idx < procs.length && procs[idx].arrival <= t) {
      queues[0].push(procs[idx]);
      idx += 1;
    }
  };

  while (!allDone(procs)) {
    enqueueArrivals();

    const level = queues.findIndex((q) => q.length > 0);
    if (level === -1) {
      timeline.push("-");
      t += 1;
      continue;
    }

    const current = queues[level].shift()!;
    const slice = Math.min(quanta[level], current.remaining);

    for (let i = 0; i < slice; i += 1) {
      timeline.push(current.id);
      current.remaining -= 1;
      t += 1;
      enqueueArrivals();
      if (current.remaining <= 0) break;
    }

    if (current.remaining > 0) {
      const nextLevel = Math.min(level + 1, queues.length - 1);
      queues[nextLevel].push(current);
    }
  }

  return timeline;
};

export const generateCpuProblem = (): CpuProblem => {
  const count = 4;
  const processes: CpuProcess[] = [];
  let arrival = 0;

  for (let i = 0; i < count; i += 1) {
    if (i === 0) {
      arrival = 0;
    } else {
      arrival += Math.floor(Math.random() * 3);
    }

    processes.push({
      id: PROCESS_IDS[i],
      arrival,
      burst: 1 + Math.floor(Math.random() * 6),
    });
  }

  return {
    id: `cpu-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    processes,
    quantum: 1 + Math.floor(Math.random() * 4),
    createdAt: Date.now(),
  };
};

export const runCpuPolicy = (problem: CpuProblem, policy: CpuPolicy): CpuPolicyResult => {
  let timeline: string[];

  switch (policy) {
    case "FIFO":
      timeline = fifo(problem.processes);
      break;
    case "SJF":
      timeline = sjf(problem.processes);
      break;
    case "STCF":
      timeline = stcf(problem.processes);
      break;
    case "RR":
      timeline = rr(problem.processes, problem.quantum);
      break;
    case "MLFQ":
      timeline = mlfq(problem.processes);
      break;
    default:
      timeline = fifo(problem.processes);
  }

  return {
    timeline,
    matrix: buildMatrix(problem.processes, timeline),
    description: policyDescriptions[policy],
  };
};

const countMatches = (solution: string[][], student: string[][]): number => {
  let correct = 0;
  for (let r = 0; r < solution.length; r += 1) {
    for (let c = 0; c < solution[r].length; c += 1) {
      if (student[r]?.[c] === solution[r][c]) correct += 1;
    }
  }
  return correct;
};

export const evaluateCpuAnswer = (
  problem: CpuProblem,
  policy: CpuPolicy,
  studentMatrix: string[][]
): CpuFeedbackResult => {
  const { matrix } = runCpuPolicy(problem, policy);
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  if (!Array.isArray(studentMatrix) || studentMatrix.length !== rows) {
    return {
      isCorrect: false,
      score: 0,
      feedback: "Answer shape is invalid. Please fill all process rows.",
    };
  }

  for (let r = 0; r < rows; r += 1) {
    if (!Array.isArray(studentMatrix[r]) || studentMatrix[r].length !== cols) {
      return {
        isCorrect: false,
        score: 0,
        feedback: "Answer shape is invalid. Please fill every time column.",
      };
    }
  }

  for (let c = 0; c < cols; c += 1) {
    let selected = 0;
    for (let r = 0; r < rows; r += 1) {
      if (studentMatrix[r][c] !== "-") selected += 1;
    }
    if (selected > 1) {
      return {
        isCorrect: false,
        score: 0,
        feedback: `Time ${c}: multiple processes selected. Only one may run at a time.`,
      };
    }
  }

  const total = rows * cols;
  const correct = countMatches(matrix, studentMatrix);
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  if (correct === total) {
    return {
      isCorrect: true,
      score,
      feedback: "Perfect. Your schedule matches the solution.",
    };
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (studentMatrix[r][c] !== matrix[r][c]) {
        const p = problem.processes[r];
        if (studentMatrix[r][c] !== "-" && c < p.arrival) {
          return {
            isCorrect: false,
            score,
            feedback: `Process ${p.id} cannot run at time ${c}; it arrives at ${p.arrival}.`,
          };
        }

        return {
          isCorrect: false,
          score,
          feedback: `First mismatch at process ${p.id}, time ${c}. Re-check ready-queue decisions around that point.`,
        };
      }
    }
  }

  return {
    isCorrect: false,
    score,
    feedback: "Your schedule is close but not exact.",
  };
};

export const getCpuPolicyDescription = (policy: CpuPolicy): string => {
  return policyDescriptions[policy] ?? "Unknown policy.";
};
