import axios from "axios";

const API_URL = "http://localhost:5000"; // Update if backend URL changes

// Register User
export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res; // Returns token
  } catch (error) {
    throw error.response?.data?.msg || "Registration failed.";
  }
};

// Login User
export const loginUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/login`, userData);
    return res; // Returns token
  } catch (error) {
    throw error.response?.data?.msg || "Login failed.";
  }
};

// Logout (Remove Token)
export const logoutUser = () => {
  localStorage.removeItem("token");
};
