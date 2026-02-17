import React, { ReactNode, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import CpuScheduling from "./pages/CpuScheduling";
import PageReplacement from "./pages/PageReplacement";

function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  return (
    <Router>
      {isAuthenticated ? (
        <DashboardNavbar setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <MainNavbar />
      )}

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login onAuth={() => setIsAuthenticated(true)} /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/verify" element={<PageWrapper><Verify /></PageWrapper>} />
          <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
          <Route path="/cpu-scheduling" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CpuScheduling /></ProtectedRoute>} />
          <Route path="/page-replacement" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PageReplacement /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

const MainNavbar = (): JSX.Element => (
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

const DashboardNavbar = ({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}): JSX.Element => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
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

const PageWrapper = ({ children }: { children: ReactNode }): JSX.Element => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: ReactNode;
}): JSX.Element => (
  isAuthenticated ? <>{children}</> : <Navigate to="/login" />
);

export default App;
