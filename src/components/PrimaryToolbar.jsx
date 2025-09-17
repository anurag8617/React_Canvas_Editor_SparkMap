import React from "react";
import { useStore } from "../store";
import {
  FiSquare,
  FiType,
  FiEdit3,
  FiTrash2,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiImage,
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
        toolName="images"
        icon={<FiImage size={20} />}
        title="Images"
      />
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
