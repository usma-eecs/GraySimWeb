import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import CpuScheduling from './pages/CpuScheduling';
import PageReplacement from './pages/PageReplacement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token"); // true if token exists
  });

  return (
    <Router>
      {/* Different Navbar for Dashboard */}
      {isAuthenticated ? (
        <DashboardNavbar setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <MainNavbar />
      )}

      {/* Page Transitions */}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login onAuth={() => setIsAuthenticated(true)} /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register onAuth={() => setIsAuthenticated(true)} /></PageWrapper>} />
          <Route path="/verify" element={<PageWrapper><Verify /></PageWrapper>} />
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
          <Route path="/cpu-scheduling" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CpuScheduling /></ProtectedRoute>} />
          <Route path="/page-replacement" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PageReplacement /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

/* Navbar for Home, Login, and Register */
const MainNavbar = () => (
  <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
    <Container>
      <Navbar.Brand as={Link} to="/">Gray Sim Web</Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/login">Login</Nav.Link>
          <Nav.Link as={Link} to="/register">Register</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

/* Navbar for Dashboard (Shows Logout) */
const DashboardNavbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">Gray Sim Web</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/cpu-scheduling">CPU Scheduling</Nav.Link>
            <Nav.Link as={Link} to="/page-replacement">Page Replacement</Nav.Link>
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};


/* PageWrapper for Animations */
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

/* Protects Routes */
const ProtectedRoute = ({ isAuthenticated, children }) => (
  isAuthenticated ? children : <Navigate to="/login" />
);

export default App;
