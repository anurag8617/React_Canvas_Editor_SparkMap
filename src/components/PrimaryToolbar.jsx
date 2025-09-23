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
