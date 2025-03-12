import React from "react";

const CustomButton = ({ text, onClick, color = "blue" }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: color,
        padding: "10px 20px",
        color: "white",
        fontSize: "1rem",
        border: "none",
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
};

export default CustomButton;
