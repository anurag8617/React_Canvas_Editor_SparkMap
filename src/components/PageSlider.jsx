// import React from "react";
// import { useStore } from "../store";

// const PageSlider = () => {
//   // ✨ MODIFIED: Get the new functions from the store
//   const {
//     pages,
//     activePageIndex,
//     addPage,
//     setActivePage,
//     deletePage,
//     updatePageTitle,
//   } = useStore();

//   // --- Main container style (no change) ---
//   const pageSliderStyle = {
//     backgroundColor: "#f1f5f9",
//     padding: "1rem",
//     borderRadius: "1rem",
//     marginTop: "1.5rem",
//     display: "flex",
//     flexDirection: "column",
//     gap: "0.75rem",
//   };

//   // --- ✨ NEW STYLES for the list item, input, and delete button ---
//   const pageItemStyle = (isActive) => ({
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "0.25rem 0.5rem",
//     borderRadius: "0.5rem",
//     border: isActive ? "2px solid #b53b74" : "2px solid #cbd5e1",
//     backgroundColor: isActive ? "#dfacc4ff" : "white",
//     cursor: "pointer",
//   });

//   const titleInputStyle = {
//     border: "none",
//     background: "transparent",
//     outline: "none",
//     fontWeight: "500",
//     width: "100%",
//     padding: "0.5rem 0",
//   };

//   const deleteButtonStyle = {
//     background: "none",
//     border: "none",
//     cursor: "pointer",
//     fontSize: "1.2rem",
//     padding: "0 0.5rem",
//     color: "#475569",
//   };

//   return (
//     <div style={pageSliderStyle}>
//       {/* ✨ MODIFIED: Heading is now dynamic */}
//       <h3 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
//         {pages[activePageIndex]?.title || "Page"}
//       </h3>

//       <div
//         style={{
//           maxHeight: "200px",
//           overflowY: "auto",
//           display: "flex",
//           flexDirection: "column",
//           gap: "0.5rem",
//         }}
//       >
//         {/* ✨ MODIFIED: The map now renders an input and a delete button */}
//         {pages.map((page, index) => (
//           <div
//             key={index}
//             onClick={() => setActivePage(index)}
//             style={pageItemStyle(index === activePageIndex)}
//           >
//             <input
//               type="text"
//               value={page.title}
//               onChange={(e) => updatePageTitle(index, e.target.value)}
//               onClick={(e) => e.stopPropagation()} // Prevent parent onClick
//               style={titleInputStyle}
//             />
//             <button
//               onClick={(e) => {
//                 e.stopPropagation(); // Prevent parent onClick
//                 if (
//                   window.confirm(
//                     `Are you sure you want to delete "${page.title}"?`
//                   )
//                 ) {
//                   deletePage(index);
//                 }
//               }}
//               style={deleteButtonStyle}
//               title="Delete Page"
//             >
//               🗑️
//             </button>
//           </div>
//         ))}
//       </div>
//       <button
//         onClick={addPage}
//         className="btn-primary"
//         style={{ marginTop: "0.5rem" }}
//       >
//         + Add Page
//       </button>
//     </div>
//   );
// };

// export default PageSlider;

import React, { useEffect, useState } from "react";
import { useStore } from "../store";
import * as fabric from "fabric";
import { MdDelete } from "react-icons/md";

const PageSlider = () => {
  const {
    pages,
    activePageIndex,
    setActivePage,
    addPage,
    deletePage,
    updatePageTitle,
  } = useStore();
  const [thumbnails, setThumbnails] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null); // Track hover

  // Generate landscape thumbnails
  useEffect(() => {
    const newThumbs = pages.map((page) => {
      const tempCanvas = new fabric.Canvas(null, { width: 160, height: 90 });
      // ✨ FIXED: Use the last state from the undoStack to generate the thumbnail
      tempCanvas.loadFromJSON(page.undoStack[page.undoStack.length - 1], () => {
        tempCanvas.setBackgroundColor(tempCanvas.backgroundColor);
        tempCanvas.renderAll();
      });
      return tempCanvas.toDataURL({ format: "png" });
    });
    setThumbnails(newThumbs);
  }, [pages]);

  return (
    <div
      style={{
        overflowX: "auto",
        padding: "0.5rem",
        display: "flex",
        gap: "1rem",
        background: "#2a2a2a",
        borderRadius: "0.5rem",
      }}
    >
      {pages.map((page, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "160px",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Thumbnail */}
          <div
            onClick={() => setActivePage(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              border:
                index === activePageIndex
                  ? "2px solid #b53b74"
                  : "1px solid #cbd5e1",
              backgroundColor: "#ffffffff",
              boxSizing: "birder-size",
              borderRadius: "0.25rem",
              overflow: "hidden",
              cursor: "pointer",
              width: "160px",
              height: "90px",
              boxShadow:
                index === activePageIndex
                  ? "0 2px 6px rgba(0,0,0,0.2)"
                  : "none",
              position: "relative",
            }}
          >
            <img
              src={thumbnails[index]}
              alt={`Slide ${index + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Delete Button (show when hovered) */}
            {hoveredIndex === index && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${page.title}"?`))
                    deletePage(index);
                }}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  color: "rgba(240, 58, 58, 1)",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  padding: "2px 4px",
                }}
              >
                <MdDelete />
              </button>
            )}
          </div>

          {/* Slide title */}
          <input
            type="text"
            value={page.title}
            onChange={(e) => updatePageTitle(index, e.target.value)}
            style={{
              marginTop: "4px",
              width: "100%",
              textAlign: "center",
              border: "none",
              color: "white",
              background: "transparent",
              outline: "none",
              fontSize: "0.85rem",
              fontWeight: index === activePageIndex ? "600" : "500",
            }}
          />
        </div>
      ))}

      {/* Add Slide Button */}
      <div
        onClick={addPage}
        style={{
          minWidth: "160px",
          height: "90px",
          border: "2px dashed #b53b74",
          borderRadius: "0.25rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#b53b74",
          fontWeight: "600",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        + Add Slide
      </div>
    </div>
  );
};

export default PageSlider;
