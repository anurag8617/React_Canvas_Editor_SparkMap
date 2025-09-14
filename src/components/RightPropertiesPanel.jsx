import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store";
import * as fabric from "fabric";

const RightPropertiesPanel = () => {
  const { canvas, activeObject, saveState } = useStore();

  // State for the canvas background color input
  const [canvasBgColor, setCanvasBgColor] = useState("rgba(255, 255, 255, 1)");

  // A single state object to hold all properties of the selected object
  const [properties, setProperties] = useState({
    fill: "#fffdfdff",
    stroke: "#000000",
    strokeWidth: 0,
    opacity: 0,
    fontFamily: "Arial",
    fontSize: 40,
    fontWeight: "normal",
    textAlign: "left",
    textDecoration: "normal",
    borderRadius: 0,
  });

  // Ref to prevent applying changes on the initial load of an object
  const isInitialLoad = useRef(true);

  // Effect to sync the background color input with the actual canvas
  useEffect(() => {
    if (canvas) {
      setCanvasBgColor(canvas.backgroundColor);
    }
  }, [canvas]);

  // Effect to POPULATE the panel when the active object changes
  useEffect(() => {
    if (activeObject) {
      isInitialLoad.current = true; // Set flag to prevent immediate apply

      // ✨ FIX: Defined isText and isRect inside this effect's scope
      const isText = activeObject.type === "textbox";
      const isRect = activeObject.type === "rect";

      setProperties({
        fill: activeObject.get("fill") || "#000000",
        stroke: activeObject.get("stroke") || "#000000",
        strokeWidth: activeObject.get("strokeWidth") || 0,
        opacity: activeObject.get("opacity") || 1,
        fontFamily: isText ? activeObject.get("fontFamily") : "Arial",
        fontSize: isText ? activeObject.get("fontSize") : 40,
        fontWeight: isText ? activeObject.get("fontWeight") : "normal",
        textAlign: isText ? activeObject.get("textAlign") : "left",
        textDecoration: getDecoration(activeObject),
        borderRadius: isRect ? activeObject.get("rx") || 0 : 0,
      });
    }
  }, [activeObject]);

  // Effect to APPLY changes whenever the user modifies a property
  useEffect(() => {
    if (!activeObject || !canvas) return;

    // Don't apply changes on the initial population of the form
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Apply generic properties to all objects
    activeObject.set({
      fill: properties.fill,
      stroke: properties.stroke,
      strokeWidth: parseInt(properties.strokeWidth, 10) || 0,
      opacity: parseFloat(properties.opacity) || 0,
    });

    // ✨ FIX: Only apply rectangle-specific properties to rectangles
    if (activeObject.type === "rect") {
      activeObject.set({
        rx: parseInt(properties.borderRadius, 10) || 0,
        ry: parseInt(properties.borderRadius, 10) || 0,
      });
    }

    // ✨ FIX: Only apply text-specific properties to textboxes
    if (activeObject.type === "textbox") {
      activeObject.set({
        fontFamily: properties.fontFamily,
        fontSize: parseInt(properties.fontSize, 10) || 40,
        fontWeight: properties.fontWeight,
        textAlign: properties.textAlign,
        underline: properties.textDecoration === "underline",
        linethrough: properties.textDecoration === "line-through",
        overline: properties.textDecoration === "overline",
      });
    }

    canvas.requestRenderAll();
    saveState();
  }, [properties, activeObject, canvas, saveState]);

  // Helper function to get text decoration style from an object
  const getDecoration = (obj) => {
    if (!obj || obj.type !== "textbox") return "normal";
    if (obj.get("underline")) return "underline";
    if (obj.get("linethrough")) return "line-through";
    if (obj.get("overline")) return "overline";
    return "normal";
  };

  // Generic handler for all property input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProperties((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers for canvas-specific properties
  const handleCanvasBgChange = (e) => {
    if (!canvas) return;
    const color = e.target.value;
    setCanvasBgColor(color);
    canvas.backgroundColor = color;
    canvas.requestRenderAll();
    saveState();
  };

  // Check object type for conditional rendering
  const isTextObject = activeObject?.type === "textbox";
  const isRect = activeObject?.type === "rect";

  function fitToParent(parentWidth, parentHeight, aspectWidth, aspectHeight) {
    const aspectRatio = aspectWidth / aspectHeight;

    let width = parentWidth;
    let height = width / aspectRatio;

    if (height > parentHeight) {
      height = parentHeight;
      width = height * aspectRatio;
    }

    return { width, height };
  }

  return (
    <aside className="properties-panel">
      {/* Canvas Properties - Always visible */}
      <div className="property-section">
        <h3>Canvas</h3>
        <div className="property-row">
          <label htmlFor="canvas-bg-color">Background</label>
          <input
            id="canvas-bg-color"
            type="color"
            value={canvasBgColor}
            onChange={handleCanvasBgChange}
          />
        </div>
      </div>

      <div className="toolbar-separator" style={{ margin: "1.5rem 0" }} />

      {/* ✨ FIX: Restructured to show either object properties or a message */}
      {activeObject ? (
        <div className="property-section">
          <h3>Object</h3>
          {/* Generic Properties */}
          <div className="property-row">
            <label>Fill</label>
            <input
              type="color"
              name="fill"
              value={properties.fill}
              onChange={handleInputChange}
            />
          </div>
          <div className="property-row">
            <label>Stroke</label>
            <input
              type="color"
              name="stroke"
              value={properties.stroke}
              onChange={handleInputChange}
            />
          </div>
          <div className="property-row">
            <label>Stroke Width</label>
            <input
              type="number"
              name="strokeWidth"
              value={properties.strokeWidth}
              onChange={handleInputChange}
            />
          </div>
          <div className="property-row">
            <label>Opacity</label>
            <input
              type="range"
              name="opacity"
              min="0"
              max="1"
              step="0.01"
              value={properties.opacity}
              onChange={handleInputChange}
            />
          </div>

          {/* Rectangle-Specific Properties */}
          {isRect && (
            <div className="property-row">
              <label>Border Radius</label>
              <input
                type="number"
                name="borderRadius"
                value={properties.borderRadius}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Text-Specific Properties */}
          {isTextObject && (
            <>
              <div className="property-row">
                <label>Font</label>
                <select
                  name="fontFamily"
                  value={properties.fontFamily}
                  onChange={handleInputChange}
                >
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                  <option>Georgia</option>
                  <option>Verdana</option>
                </select>
              </div>
              <div className="property-row">
                <label>Font Size</label>
                <input
                  type="number"
                  name="fontSize"
                  value={properties.fontSize}
                  onChange={handleInputChange}
                />
              </div>
              <div className="property-row">
                <label>Weight</label>
                <select
                  name="fontWeight"
                  value={properties.fontWeight}
                  onChange={handleInputChange}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div className="property-row">
                <label>Align</label>
                <select
                  name="textAlign"
                  value={properties.textAlign}
                  onChange={handleInputChange}
                >
                  <option>left</option>
                  <option>center</option>
                  <option>right</option>
                  <option>justify</option>
                </select>
              </div>
              <div className="property-row">
                <label>Decoration</label>
                <select
                  name="textDecoration"
                  value={properties.textDecoration}
                  onChange={handleInputChange}
                >
                  <option>normal</option>
                  <option>underline</option>
                  <option>line-through</option>
                  <option>overline</option>
                </select>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{ padding: "0 1rem", color: "#64748b", textAlign: "center" }}
        >
          Select an object to see its properties.
        </div>
      )}
    </aside>
  );
};

export default RightPropertiesPanel;
