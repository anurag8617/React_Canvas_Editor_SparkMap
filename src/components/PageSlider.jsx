import React, { useEffect, useState } from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
import { FiX } from "react-icons/fi";

const PageSlider = () => {
  const {
    pages,
    activePageIndex,
    setActivePage,
    addPage,
    historyTimestamp,
    deletePage,
  } = useStore();
  const [thumbnails, setThumbnails] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const generateThumbs = async () => {
      const thumbPromises = pages.map(
        (page) =>
          new Promise((resolve) => {
            // Your temporary canvas for generating thumbnails
            const tempCanvas = new fabric.StaticCanvas(null, {
              width: 160, // higher resolution for better quality
              height: 90,
            });
            const pageState = page.undoStack[page.undoStack.length - 1];

            tempCanvas.loadFromJSON(pageState, () => {
              tempCanvas.backgroundColor =
                pageState.backgroundColor || "#ffffff";

              // ----------------------------------------------------------------
              // ✅ FIX: This new logic correctly fits the entire canvas into the thumbnail.
              // ----------------------------------------------------------------

              // 1. Get original canvas dimensions from the saved state.
              const originalWidth = pageState.width || 1920; // Default fallback
              const originalHeight = pageState.height || 1080; // Default fallback

              // 2. Calculate the scale factor to fit the whole canvas.
              const scale = Math.min(
                tempCanvas.width / originalWidth,
                tempCanvas.height / originalHeight
              );

              // 3. Set the zoom and center the content.
              tempCanvas.setZoom(scale);
              const panX = (tempCanvas.width - originalWidth * scale) / 2;
              const panY = (tempCanvas.height - originalHeight * scale) / 2;
              tempCanvas.viewportTransform[4] = panX;
              tempCanvas.viewportTransform[5] = panY;

              // ----------------------------------------------------------------
              // The old logic (which caused the problem) is removed.
              // ----------------------------------------------------------------

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
        padding: "1rem 1rem 0 1rem",
        overflowX: "auto",
        alignItems: "center",
      }}
    >
      {/* Add this check to prevent crashes */}
      {Array.isArray(pages) &&
        pages.map((page, index) => (
          <div
            key={index}
            style={{
              flexShrink: 0,
              cursor: "pointer",
              position: "relative",
            }}
            onClick={() => setActivePage(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              style={{
                width: 100,
                height: 60,
                border:
                  activePageIndex === index
                    ? "3px solid #b53b74"
                    : "1px solid #555",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {thumbnails[index] && (
                <img
                  src={thumbnails[index]}
                  alt={page.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0, 0, 0, 0.6)",
                color: "white",
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                pointerEvents: "none",
              }}
            >
              {index + 1}
            </div>

            {hoveredIndex === index && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
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
        ))}

      <div
        onClick={addPage}
        style={{
          flexShrink: 0,
          width: 100,
          height: 60,
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
