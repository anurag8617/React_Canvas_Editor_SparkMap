// import React, { useRef } from "react";
// import { useStore } from "../store";
// import { fabric } from "fabric";
// import {
//   MdCropSquare,
//   MdRadioButtonUnchecked,
//   MdChangeHistory,
//   MdContentCopy,
//   MdOutlineGroup,
//   MdCloseFullscreen, // ✅ instead of MdOutlineUngroup
//   MdArrowUpward,
// } from "react-icons/md";
// const uploadInputRef = useRef(null);

// const LeftToolbar = () => {
//   const {
//     canvas,
//     saveState,
//     activeTool,
//     duplicate,
//     group,
//     ungroup,
//     bringForward,
//     sendBackwards,
//   } = useStore();

//   // ✅ 4. Function to add an image to the canvas from a URL
//   const addImageFromUrl = (url) => {
//     if (!canvas) return;
//     fabric.Image.fromURL(
//       url,
//       (img) => {
//         img.scaleToWidth(200); // Scale image to a default size
//         canvas.add(img).centerObject(img).renderAll();
//         saveState();
//       },
//       { crossOrigin: "anonymous" }
//     ); // Needed for images from other domains
//   };

//   // ✅ 5. Function to handle file upload
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       addImageFromUrl(event.target.result);
//     };
//     reader.readAsDataURL(file);
//     e.target.value = ""; // Reset input value
//   };

//   const addShape = (shapeType) => {
//     if (!canvas) return;
//     let shape;
//     if (shapeType === "rect") {
//       shape = new fabric.Rect({
//         width: 100,
//         height: 100,
//         fill: "#FF6B6B",
//         top: 50,
//         left: 50,
//       });
//     } else if (shapeType === "circle") {
//       shape = new fabric.Circle({
//         radius: 50,
//         fill: "#4D96FF",
//         top: 100,
//         left: 100,
//       });
//     } else if (shapeType === "triangle") {
//       shape = new fabric.Triangle({
//         width: 100,
//         height: 100,
//         fill: "#FFD56B",
//         top: 50,
//         left: 50,
//       });
//     }
//     canvas.add(shape).setActiveObject(shape);
//     saveState();
//   };

//   return (
//     <div className="left-toolbar">
//       {activeTool === "shapes" && (
//         <div>
//           <h3>Shapes</h3>
//           <button
//             onClick={() => addShape("rect")}
//             style={{ marginBottom: "0.5rem", width: "100%" }}
//           >
//             <MdCropSquare size={20} style={{ marginRight: "6px" }} />
//             Rectangle
//           </button>
//           <button
//             onClick={() => addShape("circle")}
//             style={{ marginBottom: "0.5rem", width: "100%" }}
//           >
//             <MdRadioButtonUnchecked size={20} style={{ marginRight: "6px" }} />
//             Circle
//           </button>
//           <button
//             onClick={() => addShape("triangle")}
//             style={{ width: "100%" }}
//           >
//             <MdChangeHistory size={20} style={{ marginRight: "6px" }} />
//             Triangle
//           </button>
//         </div>
//       )}
//       {activeTool === "edit" && (
//         <div
//           style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
//         >
//           <h3>Edit Tools</h3>
//           <button onClick={duplicate}>
//             <MdContentCopy size={20} style={{ marginRight: "6px" }} />
//             Duplicate
//           </button>
//           <button onClick={group}>
//             <MdOutlineGroup size={20} style={{ marginRight: "6px" }} />
//             Group
//           </button>
//           <button onClick={ungroup}>
//             <MdCloseFullscreen size={20} style={{ marginRight: "6px" }} />
//             Ungroup
//           </button>
//           <hr style={{ border: "1px solid #555", margin: "1rem 0" }} />
//           <button onClick={bringForward}>
//             <MdArrowUpward size={20} style={{ marginRight: "6px" }} />
//             Bring Forward
//           </button>
//           <button onClick={sendBackwards}>
//             <MdArrowDownward size={20} style={{ marginRight: "6px" }} />
//             Send Backwards
//           </button>
//         </div>
//       )}
//       {activeTool === "images" && (
//         <div>
//           <h3>Images</h3>
//           <button
//             onClick={() => uploadInputRef.current?.click()}
//             style={{ width: "100%", marginBottom: "1rem" }}
//             className="btn-primary"
//           >
//             Upload Image
//           </button>
//           <input
//             type="file"
//             accept="image/*"
//             ref={uploadInputRef}
//             onChange={handleImageUpload}
//             style={{ display: "none" }}
//           />

//           <div className="image-grid">
//             {images.map((imgUrl, i) => (
//               <div
//                 key={i}
//                 className="image-item"
//                 onClick={() => addImageFromUrl(imgUrl)}
//               >
//                 <img src={imgUrl} alt={`pre-built image ${i + 1}`} />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LeftToolbar;

import React, { useRef } from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
// ✅ FIX #1: Added the new icons to the import statement here.
import {
  MdCropSquare,
  MdRadioButtonUnchecked,
  MdChangeHistory,
  MdContentCopy,
  MdOutlineGroup,
  MdCloseFullscreen,
  MdArrowUpward,
  MdArrowDownward,
  MdBlurOn,
  MdRemove,
  MdPentagon,
  MdStarBorder,
} from "react-icons/md";

const LeftToolbar = () => {
  // ✅ FIX #2: Removed the incorrect icon names from this hook.
  const {
    canvas,
    saveState,
    activeTool,
    duplicate,
    group,
    ungroup,
    bringForward,
    sendBackwards,
    images,
  } = useStore();
  const uploadInputRef = useRef(null);

  const addShape = (shapeType) => {
    if (!canvas) return;
    let shape;

    if (shapeType === "rect") {
      shape = new fabric.Rect({
        width: 100,
        height: 100,
        fill: "#FF6B6B",
        top: 50,
        left: 50,
      });
    } else if (shapeType === "circle") {
      shape = new fabric.Circle({
        radius: 50,
        fill: "#4D96FF",
        top: 100,
        left: 100,
      });
    } else if (shapeType === "triangle") {
      shape = new fabric.Triangle({
        width: 100,
        height: 100,
        fill: "#FFD56B",
        top: 50,
        left: 50,
      });
    } else if (shapeType === "ellipse") {
      shape = new fabric.Ellipse({
        rx: 75,
        ry: 40,
        fill: "#9370DB",
        top: 150,
        left: 150,
      });
    } else if (shapeType === "line") {
      shape = new fabric.Line([0, 0, 150, 0], {
        stroke: "#00BFFF",
        strokeWidth: 4,
        top: 200,
        left: 50,
      });
    } else if (shapeType === "pentagon") {
      shape = new fabric.Polygon(
        [
          { x: 50, y: 0 },
          { x: 100, y: 40 },
          { x: 80, y: 90 },
          { x: 20, y: 90 },
          { x: 0, y: 40 },
        ],
        {
          fill: "#32CD32",
          top: 250,
          left: 150,
        }
      );
    } else if (shapeType === "star") {
      shape = new fabric.Polygon(
        [
          { x: 50, y: 0 },
          { x: 65, y: 40 },
          { x: 100, y: 40 },
          { x: 75, y: 65 },
          { x: 85, y: 100 },
          { x: 50, y: 80 },
          { x: 15, y: 100 },
          { x: 25, y: 65 },
          { x: 0, y: 40 },
          { x: 35, y: 40 },
        ],
        {
          fill: "#FF4500",
          top: 200,
          left: 300,
        }
      );
    }

    if (shape) {
      canvas.add(shape).setActiveObject(shape);
      saveState();
    }
  };

  const addImageFromUrl = (url) => {
    if (!canvas) return;
    fabric.Image.fromURL(
      url,
      (img) => {
        img.scaleToWidth(200);
        canvas.add(img).centerObject(img).renderAll();
        saveState();
      },
      { crossOrigin: "anonymous" }
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      addImageFromUrl(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="left-toolbar">
      {activeTool === "shapes" && (
        <div>
          <h3>Shapes</h3>
          <button
            onClick={() => addShape("rect")}
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            <MdCropSquare size={20} style={{ marginRight: "6px" }} />
            Rectangle
          </button>
          <button
            onClick={() => addShape("circle")}
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            <MdRadioButtonUnchecked size={20} style={{ marginRight: "6px" }} />
            Circle
          </button>
          <button
            onClick={() => addShape("triangle")}
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            <MdChangeHistory size={20} style={{ marginRight: "6px" }} />
            Triangle
          </button>
          <button
            onClick={() => addShape("ellipse")}
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            <MdBlurOn size={20} style={{ marginRight: "6px" }} />
            Ellipse
          </button>
          <button
            onClick={() => addShape("line")}
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            <MdRemove size={20} style={{ marginRight: "6px" }} />
            Line
          </button>
          <button
            onClick={() => addShape("pentagon")}
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            <MdPentagon size={20} style={{ marginRight: "6px" }} />
            Pentagon
          </button>
          <button onClick={() => addShape("star")} style={{ width: "100%" }}>
            <MdStarBorder size={20} style={{ marginRight: "6px" }} />
            Star
          </button>
        </div>
      )}

      {activeTool === "edit" && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <h3>Edit Tools</h3>
          <button onClick={duplicate}>
            <MdContentCopy size={20} style={{ marginRight: "6px" }} />
            Duplicate
          </button>
          <button onClick={group}>
            <MdOutlineGroup size={20} style={{ marginRight: "6px" }} />
            Group
          </button>
          <button onClick={ungroup}>
            <MdCloseFullscreen size={20} style={{ marginRight: "6px" }} />
            Ungroup
          </button>
          <hr style={{ border: "1px solid #555", margin: "1rem 0" }} />
          <button onClick={bringForward}>
            <MdArrowUpward size={20} style={{ marginRight: "6px" }} />
            Bring Forward
          </button>
          <button onClick={sendBackwards}>
            <MdArrowDownward size={20} style={{ marginRight: "6px" }} />
            Send Backwards
          </button>
        </div>
      )}

      {activeTool === "images" && (
        <div>
          <h3>Images</h3>
          <button
            onClick={() => uploadInputRef.current?.click()}
            style={{ width: "100%", marginBottom: "1rem" }}
            className="btn-primary"
          >
            Upload Image
          </button>
          <input
            type="file"
            accept="image/*"
            ref={uploadInputRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <div className="image-grid">
            {images.map((imgUrl, i) => (
              <div
                key={i}
                className="image-item"
                onClick={() => addImageFromUrl(imgUrl)}
              >
                <img src={imgUrl} alt={`pre-built image ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftToolbar;
