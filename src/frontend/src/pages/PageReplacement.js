import React from "react";
import { motion } from "framer-motion";
import { Container } from "react-bootstrap";
import "../styles/ComingSoon.css"; // Optional custom styles

const ComingSoon = () => {
  return (
    <motion.div
      className="coming-soon-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6 }}
    >
      <Container className="text-center">
        <motion.h1
          className="display-3 fw-bold text-warning"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Page Replacement
        </motion.h1>
        <motion.p
          className="lead text-light"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Our memory management revolution is almost here.
        </motion.p>
        <motion.div
          className="soon-tag mt-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
        >
          <span className="coming-soon-glow">🚧 COMING SOON 🚧</span>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default ComingSoon;
