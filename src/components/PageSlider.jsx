import React, { useEffect, useState } from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
import { FiX } from "react-icons/fi"; // ✅ 1. Import the icon

const PageSlider = () => {
  // ✅ 2. Get the deletePage function from the store
  const {
    pages,
    activePageIndex,
    setActivePage,
    addPage,
    historyTimestamp,
    deletePage,
  } = useStore();
  const [thumbnails, setThumbnails] = useState([]);
  // ✅ 3. Add state to track which thumbnail is being hovered over
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const generateThumbs = async () => {
      const thumbPromises = pages.map(
        (page) =>
          new Promise((resolve) => {
            const tempCanvas = new fabric.StaticCanvas(null, {
              width: 160,
              height: 90,
            });
            const pageState = page.undoStack[page.undoStack.length - 1];
            tempCanvas.loadFromJSON(pageState, () => {
              tempCanvas.backgroundColor =
                pageState.backgroundColor || "#ffffff";
              tempCanvas.renderAll();
              const dataUrl = tempCanvas.toDataURL({ format: "png" });
              tempCanvas.dispose();
              resolve(dataUrl);
            });
          })
      );
      const newThumbs = await Promise.all(thumbPromises);
      setThumbnails(newThumbs);
    };
    generateThumbs();
  }, [pages, historyTimestamp]);

  return (
    <div
      className="page-slider"
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        background: "#2a2a2a",
        overflowX: "auto",
      }}
    >
      {pages.map((page, index) => (
        <div
          key={index}
          style={{ flexShrink: 0, textAlign: "center", cursor: "pointer" }}
          onClick={() => setActivePage(index)}
          // ✅ 4. Add mouse events to track hovering
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            style={{
              position: "relative", // Needed for positioning the delete button
              width: 160,
              height: 90,
              border:
                activePageIndex === index
                  ? "3px solid #b53b74"
                  : "1px solid #555",
              backgroundColor: "#fff",
            }}
          >
            {thumbnails[index] && (
              <img
                src={thumbnails[index]}
                alt={page.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            {/* ✅ 5. Conditionally render the delete button when hovered */}
            {hoveredIndex === index && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the page from being selected
                  if (
                    window.confirm(
                      `Are you sure you want to delete "${page.title}"?`
                    )
                  ) {
                    deletePage(index);
                  }
                }}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          <p style={{ color: "#fff", margin: "8px 0 0" }}>
            {page.title || `Page ${index + 1}`}
          </p>
        </div>
      ))}
      <div
        onClick={addPage}
        style={{
          flexShrink: 0,
          width: 160,
          height: 90,
          border: "2px dashed #b53b74",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b53b74",
          cursor: "pointer",
          alignSelf: "center",
        }}
      >
        + Add Page
      </div>
    </div>
  );
};

export default PageSlider;
