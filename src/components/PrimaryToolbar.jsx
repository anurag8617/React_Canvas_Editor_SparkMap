// // src/components/PrimaryToolbar.js
// import React, { useState } from "react";
// import { useStore } from "../store";
// import * as fabric from "fabric";
// import {
//   FiSquare,
//   FiType,
//   FiImage,
//   FiLayers,
//   FiEdit3,
//   FiClock,
//   FiTrash2,
//   FiCornerUpLeft,
//   FiCornerUpRight,
// } from "react-icons/fi";

// const PrimaryToolbar = () => {
//   const { activeTool, setActiveTool, undo, redo, canvas, saveState } =
//     useStore();

//   const deleteActiveObjects = () => {
//     if (!canvas) return;
//     console.log("deleteActiveObjects");
//     canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
//     canvas.discardActiveObject();
//     canvas.requestRenderAll();
//     saveState();
//   };
//   // Generic button for tools
//   const ToolbarButton = ({ toolName, icon, title }) => {
//     const isActive = activeTool === toolName;
//     return (
//       <button
//         onClick={() => setActiveTool(toolName)}
//         className={`toolbar-button ${isActive ? "active" : ""}`}
//         title={title}
//       >
//         {icon}
//       </button>
//     );
//   };

//   const [text, setText] = useState("New Text");
//   const addText = () => {
//     if (!canvas || !text.trim()) return;
//     const textObject = new fabric.Textbox(text, {
//       left: 100,
//       top: 100,
//       fontSize: 24,
//       width: 200,
//       editable: true,
//     });
//     canvas.add(textObject);
//     canvas.setActiveObject(textObject);
//     canvas.requestRenderAll();
//     setTimeout(() => saveState(), 0);
//   };

//   return (
//     <div className="primary-toolbar">
//       {/* Core tools */}
//       <ToolbarButton
//         toolName="shapes"
//         icon={<FiSquare size={15} />}
//         title="Shapes"
//       />
//       <button className="toolbar-button" onClick={addText} title="Text">
//         <FiType size={15} />
//       </button>

//       <ToolbarButton
//         toolName="image"
//         icon={<FiImage size={15} />}
//         title="Image"
//       />

//       <div className="toolbar-separator" />

//       {/* Editing tools */}
//       <ToolbarButton
//         toolName="edit"
//         icon={<FiEdit3 size={15} />}
//         title="Edit"
//       />
//       <ToolbarButton
//         toolName="layers"
//         icon={<FiLayers size={15} />}
//         title="Layers"
//       />

//       <div className="toolbar-separator" />

//       <div className="toolbar-separator" />

//       {/* Quick actions (Undo/Redo/Delete) */}
//       <button onClick={undo} className="toolbar-button" title="Undo">
//         <FiCornerUpLeft size={15} />
//       </button>
//       <button onClick={redo} className="toolbar-button" title="Redo">
//         <FiCornerUpRight size={15} />
//       </button>
//       <button
//         onClick={() => deleteActiveObjects()}
//         className={`toolbar-button`}
//         title="Delete"
//       >
//         <FiTrash2 size={15} />
//       </button>
//     </div>
//   );
// };

// export default PrimaryToolbar;

import React from "react";
import { useStore } from "../store";
import {
  FiSquare,
  FiType,
  FiEdit3,
  FiTrash2,
  FiCornerUpLeft,
  FiCornerUpRight,
} from "react-icons/fi";
import { fabric } from "fabric";

const PrimaryToolbar = () => {
  const {
    canvas,
    saveState,
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelection,
  } = useStore();

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Textbox("New Text", {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 24,
      fill: "#000000",
    });
    canvas.add(text).setActiveObject(text);
    saveState();
  };

  const ToolbarButton = ({ toolName, icon, title }) => (
    <button
      onClick={() => setActiveTool(toolName)}
      style={{ background: activeTool === toolName ? "#b53b74" : "#3c3c3c" }}
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div className="primary-toolbar">
      <ToolbarButton
        toolName="shapes"
        icon={<FiSquare size={20} />}
        title="Shapes"
      />
      <button onClick={addText} title="Add Text">
        <FiType size={20} />
      </button>
      <ToolbarButton
        toolName="edit"
        icon={<FiEdit3 size={20} />}
        title="Edit Tools"
      />
      <div style={{ flex: 1 }}></div> {/* Spacer */}
      <button onClick={undo} title="Undo">
        <FiCornerUpLeft size={20} />
      </button>
      <button onClick={redo} title="Redo">
        <FiCornerUpRight size={20} />
      </button>
      <button onClick={deleteSelection} title="Delete">
        <FiTrash2 size={20} />
      </button>
    </div>
  );
};

export default PrimaryToolbar;
