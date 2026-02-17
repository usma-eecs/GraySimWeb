import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";

const AppNavbar = ({
  isAuthenticated,
  setIsAuthenticated,
}: {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}): JSX.Element => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logoutUser();
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to={isAuthenticated ? "/dashboard" : "/"}>
          Gray Sim Web
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/cpu-scheduling">CPU Scheduling</Nav.Link>
                <Nav.Link as={Link} to="/page-replacement">Page Replacement</Nav.Link>
                <Button variant="danger" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
