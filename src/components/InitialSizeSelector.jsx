import React from "react";
import { useStore } from "../store";

const InitialSizeSelector = () => {
  const { initializePageSize } = useStore();

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
    gap: "2rem",
    backgroundColor: "#1e1e1e",
  };
  
  const buttonStyle = {
    padding: "1rem 2rem",
    fontSize: "1.2rem",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "8px",
    border: "2px solid #b53b74",
    background: "transparent",
    color: "#b53b74",
    transition: "all 0.2s ease-in-out",
  };

  const handleMouseEnter = (e) => {
    e.target.style.background = "#b53b74";
    e.target.style.color = "#ffffff";
  };

  const handleMouseLeave = (e) => {
    e.target.style.background = "transparent";
    e.target.style.color = "#b53b74";
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ color: "#cbcfd4" }}>Choose Your Canvas Shape</h1>
      <div>
        <button
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => initializePageSize(800, 600)} // Landscape
        >
          Landscape
        </button>
        <button
          style={{ ...buttonStyle, marginLeft: "1rem" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => initializePageSize(600, 800)} // Portrait
        >
          Portrait
        </button>
      </div>
    </div>
  );
};

export default InitialSizeSelector;
