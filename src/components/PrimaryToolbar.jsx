// import React from "react";
// import { CgColorPicker } from "react-icons/cg";
// import { useStore } from "../store";
// import {
//   FiSquare,
//   FiType,
//   FiEdit3,
//   FiTrash2,
//   FiCornerUpLeft,
//   FiCornerUpRight,
//   FiImage,
// } from "react-icons/fi";
// import { fabric } from "fabric";

// const PrimaryToolbar = () => {
//   const {
//     canvas,
//     saveState,
//     activeTool,
//     setActiveTool,
//     undo,
//     redo,
//     deleteSelection,
//     isEyedropperActive,
//     setIsEyedropperActive,
//   } = useStore();

//   const addText = () => {
//     if (!canvas) return;
//     const text = new fabric.Textbox("New Text", {
//       left: 100,
//       top: 100,
//       width: 200,
//       fontSize: 24,
//       fill: "#000000",
//     });
//     canvas.add(text).setActiveObject(text);
//     saveState();
//   };

//   const ToolbarButton = ({ toolName, icon, title }) => (
//     <button
//       onClick={() => setActiveTool(toolName)}
//       style={{ background: activeTool === toolName ? "#b53b74" : "#3c3c3c" }}
//       title={title}
//     >
//       {icon}
//     </button>
//   );

//   const toggleEyedropper = () => {
//     setIsEyedropperActive(!isEyedropperActive);
//   };
//   return (
//     <div className="primary-toolbar">
//       <ToolbarButton
//         toolName="shapes"
//         icon={<FiSquare size={20} />}
//         title="Shapes"
//       />
//       <button onClick={addText} title="Add Text">
//         <FiType size={20} />
//       </button>
//       <button
//         onClick={toggleEyedropper}
//         title="Color Picker"
//         style={{ background: isEyedropperActive ? "#b53b74" : "#3c3c3c" }}
//       >
//         <CgColorPicker size={20} />
//       </button>
//       <ToolbarButton
//         toolName="images"
//         icon={<FiImage size={20} />}
//         title="Images"
//       />
//       <ToolbarButton
//         toolName="edit"
//         icon={<FiEdit3 size={20} />}
//         title="Edit Tools"
//       />
//       <div style={{ flex: 1 }}></div> {/* Spacer */}
//       <button onClick={undo} title="Undo">
//         <FiCornerUpLeft size={20} />
//       </button>
//       <button onClick={redo} title="Redo">
//         <FiCornerUpRight size={20} />
//       </button>
//       <button onClick={deleteSelection} title="Delete">
//         <FiTrash2 size={20} />
//       </button>
//     </div>
//   );
// };

// export default PrimaryToolbar;

import React from "react";
import { useStore } from "../store";
import { fabric } from "fabric";

// Consolidated Icon Imports
import {
  FiSquare,
  FiType,
  FiEdit3,
  FiTrash2,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiImage,
  FiGrid,
} from "react-icons/fi";
import { CgColorPicker } from "react-icons/cg";

const PrimaryToolbar = () => {
  // Get all necessary state and actions from the store
  const {
    canvas,
    saveState,
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelection,
    isColorPickerActive,
    setIsColorPickerActive,
    setPickedColor,
  } = useStore();

  // Add a new text object to the canvas
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

  // ✅ Toggle color picker tool
  const handleColorPickerClick = () => {
    const newActiveState = !isColorPickerActive;
    setIsColorPickerActive(newActiveState);
    setPickedColor(null);
  };

  // Reusable toolbar button
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
      {/* Shapes Tool */}
      <ToolbarButton
        toolName="shapes"
        icon={<FiSquare size={20} />}
        title="Shapes"
      />
      {/* Text Tool */}
      <button onClick={addText} title="Add Text">
        <FiType size={20} />
      </button>
      {/* Color Picker */}
      <button
        onClick={handleColorPickerClick}
        title="Color Picker"
        style={{ background: isColorPickerActive ? "#b53b74" : "#3c3c3c" }}
      >
        <CgColorPicker size={20} />
      </button>
      {/* Images Tool */}
      <ToolbarButton
        toolName="images"
        icon={<FiImage size={20} />}
        title="Images"
      />
      {/* Edit Tools */}
      <ToolbarButton
        toolName="edit"
        icon={<FiEdit3 size={20} />}
        title="Edit Tools"
      />
      {/* ✅ NEW: Icons Tool */}
      <ToolbarButton
        toolName="icons"
        icon={<FiGrid size={20} />}
        title="Icons"
      />
      <div style={{ flex: 1 }}></div> {/* Spacer */}
      {/* Undo / Redo / Delete */}
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
