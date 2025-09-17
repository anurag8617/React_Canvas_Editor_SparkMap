// import React, { useState } from "react";
// import * as fabric from "fabric";
// import { useStore } from "../store";
// import PageSlider from "./PageSlider";

// const LeftToolbar = () => {
//   const {
//     canvas,
//     saveState,
//     duplicate,
//     group,
//     ungroup,
//     activeTool,
//     imageGalleryUrls,
//   } = useStore();
//   const [imageUrl, setImageUrl] = useState("");

//   const addRect = () => {
//     if (!canvas) return;
//     const rect = new fabric.Rect({
//       left: 100,
//       top: 100,
//       width: 60,
//       height: 50,
//       fill: "#FF6B6B",
//       rx: 5,
//       ry: 5,
//     });
//     canvas.add(rect);
//     canvas.setActiveObject(rect);
//     canvas.requestRenderAll();
//     saveState();
//   };

//   const addCircle = () => {
//     if (!canvas) return;
//     const circle = new fabric.Circle({
//       left: 150,
//       top: 120,
//       radius: 30,
//       fill: "#4D96FF",
//     });
//     canvas.add(circle);
//     canvas.setActiveObject(circle);
//     canvas.requestRenderAll();
//     saveState();
//   };

//   const addTriangle = () => {
//     if (!canvas) return;
//     const triangle = new fabric.Triangle({
//       left: 200,
//       top: 150,
//       width: 50,
//       height: 50,
//       fill: "#FFD56B",
//     });
//     canvas.add(triangle);
//     canvas.setActiveObject(triangle);
//     canvas.requestRenderAll();
//     saveState();
//   };

//   const addStar = () => {
//     if (!canvas) return;

//     const star = new fabric.Polygon(
//       [
//         { x: 350, y: 75 },
//         { x: 380, y: 160 },
//         { x: 470, y: 160 },
//         { x: 400, y: 215 },
//         { x: 420, y: 300 },
//         { x: 350, y: 250 },
//         { x: 280, y: 300 },
//         { x: 300, y: 215 },
//         { x: 230, y: 160 },
//         { x: 320, y: 160 },
//       ],
//       {
//         fill: "#FFB86B",
//         left: 250, // reposition after scaling
//         top: 180,
//         scaleX: 0.3, // shrink horizontally
//         scaleY: 0.3, // shrink vertically
//       }
//     );

//     canvas.add(star);
//     canvas.setActiveObject(star);
//     canvas.requestRenderAll();
//     saveState();
//   };

//   const handleImageDragStart = (e, url) => {
//     try {
//       e.dataTransfer.setData("text/plain", url);
//       e.dataTransfer.setData("text/uri-list", url);
//       e.dataTransfer.setData("text/html", `<img src="${url}" />`);
//     } catch {}
//     e.dataTransfer.effectAllowed = "copy";
//   };

//   const addImageFromUrl = () => {
//     if (!canvas || !imageUrl) return;
//     fabric.Image.fromURL(
//       imageUrl,
//       (img) => {
//         canvas.add(img);
//         canvas.setActiveObject(img);
//         canvas.requestRenderAll();
//         saveState();
//       },
//       { crossOrigin: "anonymous" }
//     );
//   };

//   const handleImageUpload = (e) => {
//     if (!canvas) return;
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         fabric.Image.fromURL(event.target.result, (img) => {
//           canvas.add(img);
//           canvas.setActiveObject(img);
//           canvas.requestRenderAll();
//           saveState();
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const deleteActiveObjects = () => {
//     if (!canvas) return;
//     canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
//     canvas.discardActiveObject();
//     canvas.requestRenderAll();
//     saveState();
//   };

//   const bringForward = () => {
//     console.log("asdfghfghj")
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (activeObject) {
//       canvas.bringToFront(activeObject);
//       canvas.requestRenderAll();
//       saveState();
//     }
//   };

//   const sendBackwards = () => {
//     console.log("asdfkdfj dfn");
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (activeObject) {
//       canvas.sendToBack(activeObject);
//       canvas.requestRenderAll();
//       saveState();
//     }
//   };

//   return (
//     <aside className="left-toolbar">
//       {activeTool === "shapes" && (
//         <>
//           <h3>Shapes</h3>
//           <div className="btn-shape-grid">
//             <button onClick={addRect} className="btn-shape">
//               ▭
//             </button>
//             <button onClick={addCircle} className="btn-shape">
//               ◯
//             </button>
//             <button onClick={addTriangle} className="btn-shape">
//               △
//             </button>
//             <button onClick={addStar} className="btn-shape">
//               ★
//             </button>
//           </div>
//         </>
//       )}

//       {activeTool === "image" && (
//         <div>
//           <h3>Images</h3>
//           <p
//             style={{
//               fontSize: "0.75rem",
//               color: "#94a3b8",
//               margin: "-0.5rem 0 1rem 0",
//             }}
//           >
//             Drag an image onto the canvas.
//           </p>
//           <div className="image-gallery">
//             {imageGalleryUrls.map((url, index) => (
//               <img
//                 key={index}
//                 src={url}
//                 alt={`gallery image ${index + 1}`}
//                 className="gallery-image"
//                 draggable="true"
//                 onDragStart={(e) => handleImageDragStart(e, url)}
//                 crossOrigin="anonymous" // Important for loading external images
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {activeTool === "edit" && (
//         <>
//           <h3 style={{ marginTop: "1rem" }}>Edit</h3>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "0.5rem",
//             }}
//           >
//             <button onClick={duplicate} className="btn-secondary">
//               Duplicate
//             </button>
//             <button onClick={deleteActiveObjects} className="btn-danger">
//               Delete
//             </button>
//             <button onClick={group} className="btn-secondary">
//               Group
//             </button>
//             <button onClick={ungroup} className="btn-secondary">
//               Ungroup
//             </button>
//             <button onClick={bringForward} className="btn-secondary">
//               Bring ↑
//             </button>
//             <button onClick={sendBackwards} className="btn-secondary">
//               Send ↓
//             </button>
//           </div>
//         </>
//       )}

//       {activeTool === "layers" && (
//         <>
//           <h3 style={{ marginTop: "1rem" }}>Layers & Delete</h3>
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
//           >
//             <button onClick={bringForward} className="btn-secondary">
//               Bring Forward ↑
//             </button>
//             <button onClick={sendBackwards} className="btn-secondary">
//               Send Backward ↓
//             </button>
//             <button onClick={deleteActiveObjects} className="btn-danger">
//               Delete Selected
//             </button>
//           </div>
//         </>
//       )}
//     </aside>
//   );
// };

// export default LeftToolbar;

import React from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
import {
  MdCropSquare,
  MdRadioButtonUnchecked,
  MdChangeHistory,
  MdContentCopy,
  MdOutlineGroup,
  MdCloseFullscreen, // ✅ instead of MdOutlineUngroup
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";

const LeftToolbar = () => {
  const {
    canvas,
    saveState,
    activeTool,
    duplicate,
    group,
    ungroup,
    bringForward,
    sendBackwards,
  } = useStore();

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
    }
    canvas.add(shape).setActiveObject(shape);
    saveState();
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
            style={{ width: "100%" }}
          >
            <MdChangeHistory size={20} style={{ marginRight: "6px" }} />
            Triangle
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
    </div>
  );
};

export default LeftToolbar;
