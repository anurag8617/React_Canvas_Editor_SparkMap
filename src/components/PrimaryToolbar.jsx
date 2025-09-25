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
import { TbIcons } from "react-icons/tb";
import { LuLayoutTemplate } from "react-icons/lu";

const PrimaryToolbar = ({ setActiveTool, activeTool }) => {
  const {
    canvas,
    saveState,
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

  const primaryToolbarStyle = {
    backgroundColor: "#1e1e1e",
    borderRadius: "0.5rem",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  };

  const ToolbarButton = ({ toolName, icon, title }) => (
    <button
      onMouseEnter={() => setActiveTool(toolName)}
      style={{
        background: activeTool === toolName ? "#b53b74" : "#1e1e1e",
        cursor: "pointer",
        width: "auto",
        border: "none",
        borderRadius: "4px",
        padding: "0.5rem",
        fontSize: "0.875rem",
        color: "#f0f0f0",
      }}
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div style={primaryToolbarStyle}>
      <ToolbarButton
        toolName="shapes"
        icon={<TbIcons size={20} />}
        title="Shapes"
      />
      <button
        onClick={addText}
        title="Add Text"
        onMouseEnter={() => setActiveTool(null)}
        style={{
          background: "#1e1e1e",
          cursor: "pointer",
          width: "auto",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem",
          fontSize: "0.875rem",
          color: "#f0f0f0",
        }}
      >
        <FiType size={20} />
      </button>
      <button
        onClick={handleColorPickerClick}
        title="Color Picker"
        style={{
          background: isColorPickerActive ? "#b53b74" : "#1e1e1e",
          cursor: "pointer",
          width: "auto",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem",
          fontSize: "0.875rem",
          color: "#f0f0f0",
        }}
        onMouseEnter={() => setActiveTool(null)}
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
      <ToolbarButton
        toolName="templates"
        icon={<LuLayoutTemplate size={20} />}
        title="Templates"
      />

      <button
        onClick={undo}
        title="Undo"
        onMouseEnter={() => setActiveTool(null)}
        style={{
          background: "#1e1e1e",
          cursor: "pointer",
          width: "auto",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem",
          fontSize: "0.875rem",
          color: "#f0f0f0",
        }}
      >
        <FiCornerUpLeft size={20} />
      </button>
      <button
        onClick={redo}
        title="Redo"
        onMouseEnter={() => setActiveTool(null)}
        style={{
          background: "#1e1e1e",
          cursor: "pointer",
          width: "auto",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem",
          fontSize: "0.875rem",
          color: "#f0f0f0",
        }}
      >
        <FiCornerUpRight size={20} />
      </button>
      <button
        onClick={deleteSelection}
        title="Delete"
        onMouseEnter={() => setActiveTool(null)}
        style={{
          background: "#1e1e1e",
          cursor: "pointer",
          width: "auto",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem",
          fontSize: "0.875rem",
          color: "#f0f0f0",
        }}
      >
        <FiTrash2 size={20} />
      </button>
    </div>
  );
};

export default PrimaryToolbar;
