import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Home";
import Login from './Login';
import Register from './Register';
import Dashboard from "./Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
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
        <Nav className="ms-auto">
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </Nav>
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
