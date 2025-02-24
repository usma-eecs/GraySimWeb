import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="hero-section">
      <h1 className="fade-in">Welcome to Gray Sim Web</h1>
      <p className="fade-in">Operating Systems Made Simple</p>
      <Link to="/register" className="btn btn-primary btn-lg fade-in">
        Get Started
      </Link>
    </div>
  );
};

export default Home;
