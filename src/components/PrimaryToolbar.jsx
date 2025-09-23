// import React from "react";
// import { useStore } from "../store";
// import { fabric } from "fabric";

// // Consolidated Icon Imports
// import {
//   FiSquare,
//   FiType,
//   FiEdit3,
//   FiTrash2,
//   FiCornerUpLeft,
//   FiCornerUpRight,
//   FiImage,
//   FiGrid,
// } from "react-icons/fi";

// import { CgColorPicker } from "react-icons/cg";

// const PrimaryToolbar = () => {
//   // Get all necessary state and actions from the store
//   const {
//     canvas,
//     saveState,
//     activeTool,
//     setActiveTool,
//     undo,
//     redo,
//     deleteSelection,
//     isColorPickerActive,
//     setIsColorPickerActive,
//     setPickedColor,
//   } = useStore();

//   // Add a new text object to the canvas
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

//   // ✅ Toggle color picker tool
//   const handleColorPickerClick = () => {
//     const newActiveState = !isColorPickerActive;
//     setIsColorPickerActive(newActiveState);
//     setPickedColor(null);
//   };

//   // Reusable toolbar button
//   const ToolbarButton = ({ toolName, icon, title }) => (
//     <button
//       onClick={() => setActiveTool(toolName)}
//       style={{ background: activeTool === toolName ? "#b53b74" : "#3c3c3c" }}
//       title={title}
//     >
//       {icon}
//     </button>
//   );

//   return (
//     <div className="primary-toolbar">
//       {/* Shapes Tool */}
//       <ToolbarButton
//         toolName="shapes"
//         icon={<FiSquare size={20} />}
//         title="Shapes"
//       />
//       {/* Text Tool */}
//       <button onClick={addText} title="Add Text">
//         <FiType size={20} />
//       </button>
//       {/* Color Picker */}
//       <button
//         onClick={handleColorPickerClick}
//         title="Color Picker"
//         style={{ background: isColorPickerActive ? "#b53b74" : "#3c3c3c" }}
//       >
//         <CgColorPicker size={20} />
//       </button>
//       {/* Images Tool */}
//       <ToolbarButton
//         toolName="images"
//         icon={<FiImage size={20} />}
//         title="Images"
//       />
//       {/* Edit Tools */}
//       <ToolbarButton
//         toolName="edit"
//         icon={<FiEdit3 size={20} />}
//         title="Edit Tools"
//       />
//       {/* ✅ NEW: Icons Tool */}
//       <ToolbarButton
//         toolName="icons"
//         icon={<FiGrid size={20} />}
//         title="Icons"
//       />
//       <div style={{ flex: 1 }}></div> {/* Spacer */}
//       {/* Undo / Redo / Delete */}
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

// components/PrimaryToolbar.js
// import React, { useEffect, useState } from "react";
// import { useStore } from "../store";
// import { fabric } from "fabric";

// // Icons
// import {
//   FiSquare,
//   FiType,
//   FiEdit3,
//   FiTrash2,
//   FiCornerUpLeft,
//   FiCornerUpRight,
//   FiImage,
//   FiGrid,
//   FiSave,
// } from "react-icons/fi";
// import { CgColorPicker } from "react-icons/cg";

// const PrimaryToolbar = () => {
//   const {
//     canvas,
//     saveState,
//     activeTool,
//     setActiveTool,
//     undo,
//     redo,
//     deleteSelection,
//     isColorPickerActive,
//     setIsColorPickerActive,
//     setPickedColor,

//     // ✅ template actions
//     templates,
//     fetchTemplates,
//     saveTemplate,
//     loadTemplate,
//   } = useStore();

//   const [selectedTemplate, setSelectedTemplate] = useState("");

//   // Load templates on mount
//   useEffect(() => {
//     fetchTemplates();
//   }, [fetchTemplates]);

//   // Add new text object
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

//   // Toggle color picker
//   const handleColorPickerClick = () => {
//     const newActiveState = !isColorPickerActive;
//     setIsColorPickerActive(newActiveState);
//     setPickedColor(null);
//   };

//   // Save template (ask name)
//   const handleSaveTemplate = () => {
//     const name = prompt("Enter template name:");
//     if (!name) return;
//     saveTemplate(name);
//   };

//   // Load template
//   const handleLoadTemplate = () => {
//     if (!selectedTemplate) return;
//     loadTemplate(selectedTemplate);
//   };

//   // Toolbar button helper
//   const ToolbarButton = ({ toolName, icon, title }) => (
//     <button
//       onClick={() => setActiveTool(toolName)}
//       style={{ background: activeTool === toolName ? "#b53b74" : "#3c3c3c" }}
//       title={title}
//     >
//       {icon}
//     </button>
//   );

//   return (
//     <div className="primary-toolbar">
//       {/* Shapes Tool */}
//       <ToolbarButton
//         toolName="shapes"
//         icon={<FiSquare size={20} />}
//         title="Shapes"
//       />

//       {/* Text Tool */}
//       <button onClick={addText} title="Add Text">
//         <FiType size={20} />
//       </button>

//       {/* Color Picker */}
//       <button
//         onClick={handleColorPickerClick}
//         title="Color Picker"
//         style={{ background: isColorPickerActive ? "#b53b74" : "#3c3c3c" }}
//       >
//         <CgColorPicker size={20} />
//       </button>

//       {/* Images Tool */}
//       <ToolbarButton
//         toolName="images"
//         icon={<FiImage size={20} />}
//         title="Images"
//       />

//       {/* Edit Tools */}
//       <ToolbarButton
//         toolName="edit"
//         icon={<FiEdit3 size={20} />}
//         title="Edit Tools"
//       />

//       {/* Icons Tool */}
//       <ToolbarButton
//         toolName="icons"
//         icon={<FiGrid size={20} />}
//         title="Icons"
//       />

//       {/* ========================== */}
//       {/* ✅ Template Controls */}
//       {/* ========================== */}
//       <button onClick={handleSaveTemplate} title="Save Template">
//         <FiSave size={20} />
//       </button>

//       <select
//         value={selectedTemplate}
//         onChange={(e) => setSelectedTemplate(e.target.value)}
//         style={{ marginLeft: "8px", background: "#3c3c3c", color: "#fff" }}
//       >
//         <option value=""></option>
//         {templates.map((tpl) => (
//           <option key={tpl.id} value={tpl.id}>
//             {tpl.name}
//           </option>
//         ))}
//       </select>

//       <button
//         onClick={handleLoadTemplate}
//         disabled={!selectedTemplate}
//         // style={{ marginLeft: "4px" }}
//       >
//         Load
//       </button>

//       {/* Spacer */}
//       <div style={{ flex: 1 }}></div>

//       {/* Undo / Redo / Delete */}
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

// anurag8617/react_canvas_editor_sparkmap/React_Canvas_Editor_SparkMap-6b6c61e63d70753ed29e0c6da41bad1ecd6bbce2/src/components/PrimaryToolbar.jsx

import React, { useEffect, useState } from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
import {
  FiSquare,
  FiType,
  FiEdit3,
  FiTrash2,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiImage,
  FiGrid,
  FiSave,
} from "react-icons/fi";
import { CgColorPicker } from "react-icons/cg";

const PrimaryToolbar = () => {
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
    templates,
    fetchTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  } = useStore();

  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

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

  const handleColorPickerClick = () => {
    setIsColorPickerActive(!isColorPickerActive);
    setPickedColor(null);
  };

  const handleSaveTemplate = () => {
    const name = prompt("Enter template name:");
    if (name) saveTemplate(name);
  };

  const handleLoadTemplate = () => {
    if (selectedTemplate) loadTemplate(selectedTemplate);
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return;
    const templateToDelete = templates.find((t) => t.id == selectedTemplate);
    if (
      templateToDelete &&
      window.confirm(
        `Are you sure you want to delete "${templateToDelete.name}"?`
      )
    ) {
      deleteTemplate(selectedTemplate);
      setSelectedTemplate(""); // Reset dropdown
    }
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
      <button
        onClick={handleColorPickerClick}
        title="Color Picker"
        style={{ background: isColorPickerActive ? "#b53b74" : "#3c3c3c" }}
      >
        <CgColorPicker size={20} />
      </button>
      <ToolbarButton
        toolName="images"
        icon={<FiImage size={20} />}
        title="Images"
      />
      <ToolbarButton
        toolName="edit"
        icon={<FiEdit3 size={20} />}
        title="Edit Tools"
      />
      <ToolbarButton
        toolName="icons"
        icon={<FiGrid size={20} />}
        title="Icons"
      />

      {/* <div style={{ flex: 1 }}></div>

      <button onClick={handleSaveTemplate} title="Save Template">
        <FiSave size={20} />
      </button>

      <div className="template-list">
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <option value="">Select Template</option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
        <button onClick={handleLoadTemplate} disabled={!selectedTemplate}>
          Load
        </button>
        {selectedTemplate && (
          <button className="delete-btn" onClick={handleDeleteTemplate}>
            <FiTrash2 size={16} />
          </button>
        )}
      </div> */}
      <ToolbarButton
        toolName="templates"
        icon={<FiGrid size={20} />}
        title="Templates"
      />

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
