import axios from "axios";

const API_URL = "http://localhost:5000";

export type CpuPolicy = "FIFO" | "SJF" | "STCF" | "RR" | "MLFQ";
export type PagePolicy = "FIFO" | "LRU" | "OPT" | "CLOCK";

export interface CpuProcess {
  id: string;
  arrival: number;
  burst: number;
}

export interface CpuProblem {
  id: string;
  processes: CpuProcess[];
  quantum: number;
  createdAt: number;
  horizon: number;
}

export interface PageProblem {
  id: string;
  referenceString: number[];
  frameCount: number;
  createdAt: number;
}

export const sendVerify = async ({ email, password }: { email: string; password?: string }) => {
  try {
    return await axios.post(`${API_URL}/send-verify`, { email, password });
  } catch (error: unknown) {
    const e = error as { response?: { data?: { msg?: string } } };
    throw e.response?.data?.msg || "Request failed";
  }
};

export const verifyCode = async ({ email, code }: { email: string; code: string }) => {
  try {
    return await axios.post(`${API_URL}/verify-code`, { email, code });
  } catch (error: unknown) {
    const e = error as { response?: { data?: { msg?: string } } };
    throw e.response?.data?.msg || "Request failed";
  }
};

export const registerUser = async (userData: { email: string; password: string; acc_type?: string }) => {
  try {
    return await axios.post(`${API_URL}/register`, userData);
  } catch (error: unknown) {
    const e = error as { response?: { data?: { msg?: string } } };
    throw e.response?.data?.msg || "Request failed";
  }
};

export const loginUser = async (userData: { email: string; password: string }) => {
  try {
    return await axios.post(`${API_URL}/login`, userData);
  } catch (error: unknown) {
    const e = error as { response?: { data?: { msg?: string } } };
    throw e.response?.data?.msg || "Request failed";
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem("token");
};

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const getCpuPolicy = async (userID: string, policyName: CpuPolicy) => {
  return axios.post(
    `${API_URL}/cpu_scheduling/get_policy`,
    { userID, policyName },
    { headers: authHeaders() }
  );
};

export const getCpuFeedback = async (
  userID: string,
  policyName: CpuPolicy,
  studentAnswer: string[][]
) => {
  return axios.post(
    `${API_URL}/cpu_scheduling/get_feedback`,
    { userID, policyName, studentAnswer },
    { headers: authHeaders() }
  );
};

export const getCpuSolution = async (userID: string, policyName: CpuPolicy) => {
  return axios.post(
    `${API_URL}/cpu_scheduling/get_solution`,
    { userID, policyName },
    { headers: authHeaders() }
  );
};

export const resetCpuProblem = async (userID: string) => {
  return axios.post(`${API_URL}/cpu_scheduling/reset`, { userID }, { headers: authHeaders() });
};

export const getCpuProblem = async (userID: string) => {
  return axios.post(`${API_URL}/cpu_scheduling/get_problem`, { userID }, { headers: authHeaders() });
};

export const getPagePolicy = async (userID: string, policyName: PagePolicy) => {
  return axios.post(
    `${API_URL}/page_replacement/get_policy`,
    { userID, policyName },
    { headers: authHeaders() }
  );
};

export const getPageFeedback = async (
  userID: string,
  policyName: PagePolicy,
  studentAnswer: string[][]
) => {
  return axios.post(
    `${API_URL}/page_replacement/get_feedback`,
    { userID, policyName, studentAnswer },
    { headers: authHeaders() }
  );
};

export const getPageSolution = async (userID: string, policyName: PagePolicy) => {
  return axios.post(
    `${API_URL}/page_replacement/get_solution`,
    { userID, policyName },
    { headers: authHeaders() }
  );
};

export const resetPageProblem = async (userID: string) => {
  return axios.post(`${API_URL}/page_replacement/reset`, { userID }, { headers: authHeaders() });
};

export const getPageProblem = async (userID: string) => {
  return axios.post(`${API_URL}/page_replacement/get_problem`, { userID }, { headers: authHeaders() });
};
