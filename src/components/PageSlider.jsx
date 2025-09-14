import React from "react";
import { useStore } from "../store";

const PageSlider = () => {
  // ✨ MODIFIED: Get the new functions from the store
  const {
    pages,
    activePageIndex,
    addPage,
    setActivePage,
    deletePage,
    updatePageTitle,
  } = useStore();

  // --- Main container style (no change) ---
  const pageSliderStyle = {
    backgroundColor: "#f1f5f9",
    padding: "1rem",
    borderRadius: "1rem",
    marginTop: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  // --- ✨ NEW STYLES for the list item, input, and delete button ---
  const pageItemStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.5rem",
    border: isActive ? "2px solid #b53b74" : "2px solid #cbd5e1",
    backgroundColor: isActive ? "#dfacc4ff" : "white",
    cursor: "pointer",
  });

  const titleInputStyle = {
    border: "none",
    background: "transparent",
    outline: "none",
    fontWeight: "500",
    width: "100%",
    padding: "0.5rem 0",
  };

  const deleteButtonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: "0 0.5rem",
    color: "#475569",
  };

  return (
    <div style={pageSliderStyle}>
      {/* ✨ MODIFIED: Heading is now dynamic */}
      <h3 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
        {pages[activePageIndex]?.title || "Page"}
      </h3>

      <div
        style={{
          maxHeight: "200px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {/* ✨ MODIFIED: The map now renders an input and a delete button */}
        {pages.map((page, index) => (
          <div
            key={index}
            onClick={() => setActivePage(index)}
            style={pageItemStyle(index === activePageIndex)}
          >
            <input
              type="text"
              value={page.title}
              onChange={(e) => updatePageTitle(index, e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent parent onClick
              style={titleInputStyle}
            />
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent onClick
                if (
                  window.confirm(
                    `Are you sure you want to delete "${page.title}"?`
                  )
                ) {
                  deletePage(index);
                }
              }}
              style={deleteButtonStyle}
              title="Delete Page"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addPage}
        className="btn-primary"
        style={{ marginTop: "0.5rem" }}
      >
        + Add Page
      </button>
    </div>
  );
};

export default PageSlider;
