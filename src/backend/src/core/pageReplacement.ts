import {
  PageFeedbackResult,
  PagePolicy,
  PagePolicyResult,
  PageProblem,
} from "../types";

const policyDescriptions: Record<PagePolicy, string> = {
  FIFO: "Replace the page that entered memory first.",
  LRU: "Replace the page that has not been used for the longest time.",
  OPT: "Replace the page whose next use is farthest in the future.",
  CLOCK: "Replace pages using a circular pointer and reference bits.",
};

const buildMemory = (frames: number, steps: number): string[][] =>
  Array.from({ length: frames }, () => Array.from({ length: steps }, () => "-"));

const copyColumn = (memory: string[][], col: number): void => {
  if (col <= 0) return;
  for (let r = 0; r < memory.length; r += 1) {
    memory[r][col] = memory[r][col - 1];
  }
};

const firstEmptyFrame = (state: (number | null)[]): number => state.indexOf(null);

const pageInState = (state: (number | null)[], page: number): number =>
  state.findIndex((p) => p === page);

const persistState = (memory: string[][], state: (number | null)[], col: number): void => {
  for (let r = 0; r < state.length; r += 1) {
    memory[r][col] = state[r] === null ? "-" : String(state[r]);
  }
};

const runFifo = (problem: PageProblem): string[][] => {
  const { frameCount, referenceString } = problem;
  const memory = buildMemory(frameCount, referenceString.length);
  const state: (number | null)[] = Array.from({ length: frameCount }, () => null);
  let pointer = 0;

  for (let t = 0; t < referenceString.length; t += 1) {
    copyColumn(memory, t);
    const page = referenceString[t];
    const hit = pageInState(state, page);

    if (hit === -1) {
      const empty = firstEmptyFrame(state);
      if (empty !== -1) {
        state[empty] = page;
      } else {
        state[pointer] = page;
        pointer = (pointer + 1) % frameCount;
      }
    }

    persistState(memory, state, t);
  }

  return memory;
};

const runLru = (problem: PageProblem): string[][] => {
  const { frameCount, referenceString } = problem;
  const memory = buildMemory(frameCount, referenceString.length);
  const state: (number | null)[] = Array.from({ length: frameCount }, () => null);
  const lastUse: Map<number, number> = new Map();

  for (let t = 0; t < referenceString.length; t += 1) {
    copyColumn(memory, t);
    const page = referenceString[t];
    const hit = pageInState(state, page);

    if (hit === -1) {
      const empty = firstEmptyFrame(state);
      if (empty !== -1) {
        state[empty] = page;
      } else {
        let victimFrame = 0;
        let leastRecent = Number.POSITIVE_INFINITY;

        for (let i = 0; i < state.length; i += 1) {
          const p = state[i]!;
          const used = lastUse.get(p) ?? -1;
          if (used < leastRecent) {
            leastRecent = used;
            victimFrame = i;
          }
        }

        state[victimFrame] = page;
      }
    }

    lastUse.set(page, t);
    persistState(memory, state, t);
  }

  return memory;
};

const runOpt = (problem: PageProblem): string[][] => {
  const { frameCount, referenceString } = problem;
  const memory = buildMemory(frameCount, referenceString.length);
  const state: (number | null)[] = Array.from({ length: frameCount }, () => null);

  for (let t = 0; t < referenceString.length; t += 1) {
    copyColumn(memory, t);
    const page = referenceString[t];
    const hit = pageInState(state, page);

    if (hit === -1) {
      const empty = firstEmptyFrame(state);
      if (empty !== -1) {
        state[empty] = page;
      } else {
        let victimFrame = 0;
        let farthest = -1;

        for (let i = 0; i < state.length; i += 1) {
          const resident = state[i]!;
          const next = referenceString.slice(t + 1).indexOf(resident);
          const distance = next === -1 ? Number.POSITIVE_INFINITY : next;
          if (distance > farthest) {
            farthest = distance;
            victimFrame = i;
          }
        }

        state[victimFrame] = page;
      }
    }

    persistState(memory, state, t);
  }

  return memory;
};

const runClock = (problem: PageProblem): string[][] => {
  const { frameCount, referenceString } = problem;
  const memory = buildMemory(frameCount, referenceString.length);
  const state: (number | null)[] = Array.from({ length: frameCount }, () => null);
  const useBits: boolean[] = Array.from({ length: frameCount }, () => false);
  let hand = 0;

  for (let t = 0; t < referenceString.length; t += 1) {
    copyColumn(memory, t);
    const page = referenceString[t];
    const hit = pageInState(state, page);

    if (hit !== -1) {
      useBits[hit] = true;
      persistState(memory, state, t);
      continue;
    }

    const empty = firstEmptyFrame(state);
    if (empty !== -1) {
      state[empty] = page;
      useBits[empty] = true;
      persistState(memory, state, t);
      continue;
    }

    while (true) {
      if (!useBits[hand]) {
        state[hand] = page;
        useBits[hand] = true;
        hand = (hand + 1) % frameCount;
        break;
      }

      useBits[hand] = false;
      hand = (hand + 1) % frameCount;
    }

    persistState(memory, state, t);
  }

  return memory;
};

export const generatePageProblem = (): PageProblem => {
  const length = 10 + Math.floor(Math.random() * 5);
  const referenceString = Array.from({ length }, () => 1 + Math.floor(Math.random() * 6));

  return {
    id: `page-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    referenceString,
    frameCount: 3,
    createdAt: Date.now(),
  };
};

export const runPagePolicy = (problem: PageProblem, policy: PagePolicy): PagePolicyResult => {
  let memory: string[][];

  switch (policy) {
    case "FIFO":
      memory = runFifo(problem);
      break;
    case "LRU":
      memory = runLru(problem);
      break;
    case "OPT":
      memory = runOpt(problem);
      break;
    case "CLOCK":
      memory = runClock(problem);
      break;
    default:
      memory = runFifo(problem);
  }

  return {
    memory,
    description: policyDescriptions[policy],
  };
};

export const evaluatePageAnswer = (
  problem: PageProblem,
  policy: PagePolicy,
  studentMemory: string[][]
): PageFeedbackResult => {
  const { memory } = runPagePolicy(problem, policy);
  const rows = memory.length;
  const cols = memory[0]?.length ?? 0;

  if (!Array.isArray(studentMemory) || studentMemory.length !== rows) {
    return {
      isCorrect: false,
      score: 0,
      feedback: "Answer shape is invalid. Please include all frame rows.",
    };
  }

  for (let r = 0; r < rows; r += 1) {
    if (!Array.isArray(studentMemory[r]) || studentMemory[r].length !== cols) {
      return {
        isCorrect: false,
        score: 0,
        feedback: "Answer shape is invalid. Please fill each request column.",
      };
    }
  }

  for (let c = 0; c < cols; c += 1) {
    const seen = new Set<string>();
    for (let r = 0; r < rows; r += 1) {
      const val = studentMemory[r][c];
      if (val === "-") continue;
      if (seen.has(val)) {
        return {
          isCorrect: false,
          score: 0,
          feedback: `Column ${c}: duplicate page ${val} appears in multiple frames.`,
        };
      }
      seen.add(val);
    }
  }

  let correct = 0;
  const total = rows * cols;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (studentMemory[r][c] === memory[r][c]) {
        correct += 1;
      }
    }
  }

  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  if (correct === total) {
    return {
      isCorrect: true,
      score,
      feedback: "Perfect. Your memory table matches the solution.",
    };
  }

  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      if (studentMemory[r][c] !== memory[r][c]) {
        return {
          isCorrect: false,
          score,
          feedback: `First mismatch at request index ${c}, frame ${r}. Re-check replacement decision there.`,
        };
      }
    }
  }

  return {
    isCorrect: false,
    score,
    feedback: "Your table is close but not exact.",
  };
};

export const getPagePolicyDescription = (policy: PagePolicy): string => {
  return policyDescriptions[policy] ?? "Unknown policy.";
};
