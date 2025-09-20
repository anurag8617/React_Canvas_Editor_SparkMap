import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import {
  MdFormatColorFill,
  MdBorderColor,
  MdLineWeight,
  MdOpacity,
  MdRoundedCorner,
  MdTextFields,
  MdFormatSize,
  MdOutlineSquare,
  MdViewWeek,
  MdAutoFixHigh,
} from "react-icons/md";

// This helper function is great, no changes needed here.
const toHex = (color) => {
  if (!color || typeof color !== "string") return "#000000";
  if (color.startsWith("#")) return color;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#000000";
  ctx.fillStyle = color;
  return ctx.fillStyle;
};

const defaultProperties = {
  fill: "#000000",
  stroke: "#000000",
  strokeWidth: 0,
  opacity: 1,
  fontFamily: "Arial",
  fontSize: 40,
  fontWeight: "normal",
  textAlign: "left",
  textDecoration: "normal",
  borderRadius: 0,
};

const RightPropertiesPanel = () => {
  // ✅ Get activeColor from the store
  const { canvas, activeObject, saveState, activeColor } = useStore();
  const [props, setProps] = useState(defaultProperties);

  // This effect syncs the panel with the selected object's properties
  useEffect(() => {
    if (activeObject) {
      const getDecoration = (obj) => {
        if (obj.underline) return "underline";
        if (obj.linethrough) return "line-through";
        if (obj.overline) return "overline";
        return "normal";
      };
      setProps({
        fill: activeObject.get("fill") || "#000000",
        stroke: activeObject.get("stroke") || "#000000",
        strokeWidth: activeObject.get("strokeWidth") || 0,
        opacity: activeObject.get("opacity") ?? 1,
        fontFamily: activeObject.get("fontFamily") || "Arial",
        fontSize: activeObject.get("fontSize") || 40,
        fontWeight: activeObject.get("fontWeight") || "normal",
        textAlign: activeObject.get("textAlign") || "left",
        textDecoration: getDecoration(activeObject),
        borderRadius: activeObject.get("rx") || 0,
      });
    } else {
      setProps(defaultProperties);
    }
  }, [activeObject]);

  // This function handles all property changes from the inputs
  const handleChange = (name, value) => {
    if (!activeObject || !canvas) return;

    // Update the local state for the input controls
    setProps((prev) => ({ ...prev, [name]: value }));

    let update = { [name]: value };
    if (name === "textDecoration") {
      update = {
        underline: value === "underline",
        linethrough: value === "line-through",
        overline: value === "overline",
      };
    } else if (name === "borderRadius") {
      update = { rx: parseInt(value, 10) || 0, ry: parseInt(value, 10) || 0 };
    }

    // Apply the change to the fabric object and save state
    activeObject.set(update);
    canvas.requestRenderAll();
    saveState();
  };

  // ✅ =======================================================
  // ✅ NEW EFFECT TO "PASTE" THE EYEDROPPER COLOR
  // ✅ This automatically applies the picked color to the selected object.
  // ✅ =======================================================
  useEffect(() => {
    if (activeObject && activeColor) {
      handleChange("fill", activeColor);
    }
  }, [activeColor]); // This effect runs only when the activeColor changes

  const isTextObject = activeObject?.type === "textbox";
  const isShape =
    activeObject && ["rect", "circle", "triangle"].includes(activeObject.type);

  return (
    <div className="properties-panel">
      {/* ✅ ADDED A DISPLAY FOR THE CURRENTLY PICKED COLOR */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.8rem", color: "#888" }}>
          Picked Color
        </label>
        <div
          style={{
            width: "100%",
            height: "30px",
            backgroundColor: activeColor,
            border: "1px solid #555",
            borderRadius: "4px",
            marginTop: "4px",
          }}
        ></div>
      </div>

      {activeObject ? (
        <div>
          <h3>Properties</h3>

          {/* Generic Properties (Fill, Stroke, etc.) */}
          {/* No changes needed below this line, your existing code is perfect */}

          <div className="property-row">
            <MdFormatColorFill size={20} />
            <label>Fill</label>
            <input
              type="color"
              value={toHex(props.fill)}
              onChange={(e) => handleChange("fill", e.target.value)}
            />
          </div>

          <div className="property-row">
            <MdBorderColor size={20} />
            <label>Stroke</label>
            <input
              type="color"
              value={toHex(props.stroke)}
              onChange={(e) => handleChange("stroke", e.target.value)}
            />
          </div>

          <div className="property-row">
            <MdLineWeight size={20} />
            <label>Stroke Width</label>
            <input
              type="number"
              min="0"
              value={props.strokeWidth}
              onChange={(e) =>
                handleChange("strokeWidth", parseInt(e.target.value, 10))
              }
            />
          </div>

          <div className="property-row">
            <MdOpacity size={20} />
            <label>Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={props.opacity}
              onChange={(e) =>
                handleChange("opacity", parseFloat(e.target.value))
              }
            />
          </div>

          {isShape && activeObject.type === "rect" && (
            <div className="property-row">
              <MdRoundedCorner size={20} />
              <label>Radius</label>
              <input
                type="number"
                min="0"
                value={props.borderRadius}
                onChange={(e) => handleChange("borderRadius", e.target.value)}
              />
            </div>
          )}

          {isTextObject && (
            <>
              <hr style={{ border: "1px solid #555", margin: "1.5rem 0" }} />
              <h3>Text</h3>

              <div className="property-row">
                <MdTextFields size={20} />
                <label>Font</label>
                <select
                  value={props.fontFamily}
                  onChange={(e) => handleChange("fontFamily", e.target.value)}
                >
                  <option>Arial</option>
                  <option>Verdana</option>
                  <option>Georgia</option>
                  <option>Times New Roman</option>
                </select>
              </div>

              <div className="property-row">
                <MdFormatSize size={20} />
                <label>Size</label>
                <input
                  type="number"
                  min="1"
                  value={props.fontSize}
                  onChange={(e) =>
                    handleChange("fontSize", parseInt(e.target.value, 10))
                  }
                />
              </div>

              <div className="property-row">
                <MdOutlineSquare size={20} />
                <label>Weight</label>
                <select
                  value={props.fontWeight}
                  onChange={(e) => handleChange("fontWeight", e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              <div className="property-row">
                <MdViewWeek size={20} />
                <label>Align</label>
                <select
                  value={props.textAlign}
                  onChange={(e) => handleChange("textAlign", e.target.value)}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>

              <div className="property-row">
                <MdAutoFixHigh size={20} />
                <label>Decoration</label>
                <select
                  value={props.textDecoration}
                  onChange={(e) =>
                    handleChange("textDecoration", e.target.value)
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="underline">Underline</option>
                  <option value="line-through">Line-through</option>
                  <option value="overline">Overline</option>
                </select>
              </div>
            </>
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#888" }}>
          Select an object to see its properties.
        </p>
      )}
    </div>
  );
};

export default RightPropertiesPanel;
