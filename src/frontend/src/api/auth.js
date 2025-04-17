import axios from "axios";

const API_URL = "http://localhost:5000"; // Update if backend URL changes

export const sendVerify = async ({ email, password }) => {
  try {
    const res = await axios.post(`${API_URL}/send-verify`, { email, password });
    return res;
  } catch (error) {
    throw error.response?.data?.msg;
  }

};

// 2) Verify code
export const verifyCode = async ({ email, code }) => {
  try {
    const res = await axios.post(`${API_URL}/verify-code`, { email, code });
    return res;
  } catch (error) {
    throw error.response?.data?.msg;
  }
};

// Register User
export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res; // Returns token
  } catch (error) {
    throw error.response?.data?.msg;
  }
};

// Login User
export const loginUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/login`, userData);
    return res; // Returns token
  } catch (error) {
    throw error.response?.data?.msg;
  }
};

// Logout (Remove Token)
export const logoutUser = () => {
  localStorage.removeItem("token");
};

// CPU Scheduling

// Request scheduling policy data
export const getPolicy = async (userID, policyName) => {
  const res = await axios.post(`${API_URL}/cpu_scheduling/get_policy`, {
    userID,
    policyName,
  });
  return res;
};

// Request feedback on a student answer
export const getFeedback = async (userID, policyName, studentAnswer) => {
  const res = await axios.post(`${API_URL}/cpu_scheduling/get_feedback`, {
    userID,
    policyName,
    studentAnswer,
  });
  return res;
};

// Request the correct solution
export const getSolution = async (userID, policyName, studentAnswer) => {
  const res = await axios.post(`${API_URL}/cpu_scheduling/get_solution`, {
    userID,
    policyName,
    studentAnswer,
  });
  return res;
};

// Reset or get a new problem
export const resetProblem = async (userID) => {
  const res = await axios.post(`${API_URL}/cpu_scheduling/reset`, { userID });
  return res;
};

export const getProblem = async (userID) => {
  const res = await axios.post(`${API_URL}/cpu_scheduling/get_problem`, { userID });
  return res;
};
