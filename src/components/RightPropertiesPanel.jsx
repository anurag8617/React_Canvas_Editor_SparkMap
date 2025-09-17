// import React, { useState, useEffect, useRef } from "react";
// import { useStore } from "../store";
// import * as fabric from "fabric";

// const RightPropertiesPanel = () => {
//   const { canvas, activeObject, saveState } = useStore();

//   // State for the canvas background color input
//   const [canvasBgColor, setCanvasBgColor] = useState("rgba(255, 255, 255, 1)");

//   // A single state object to hold all properties of the selected object
//   const [properties, setProperties] = useState({
//     fill: "#ffffff",
//     stroke: "#000000",
//     strokeWidth: 0,
//     opacity: 0,
//     fontFamily: "Arial",
//     fontSize: 40,
//     fontWeight: "normal",
//     textAlign: "left",
//     textDecoration: "normal",
//     borderRadius: 0,
//   });

//   // Ref to prevent applying changes on the initial load of an object
//   const isInitialLoad = useRef(true);

//   // Effect to sync the background color input with the actual canvas
//   useEffect(() => {
//     if (canvas) {
//       setCanvasBgColor(canvas.backgroundColor);
//     }
//   }, [canvas]);

//   // Effect to POPULATE the panel when the active object changes
//   useEffect(() => {
//     if (activeObject) {
//       isInitialLoad.current = true; // Set flag to prevent immediate apply

//       // ✨ FIX: Defined isText and isRect inside this effect's scope
//       const isText = activeObject.type === "textbox";
//       const isRect = activeObject.type === "rect";

//       setProperties({
//         fill: activeObject.get("fill") || "#000000",
//         stroke: activeObject.get("stroke") || "#000000",
//         strokeWidth: activeObject.get("strokeWidth") || 0,
//         opacity: activeObject.get("opacity") || 1,
//         fontFamily: isText ? activeObject.get("fontFamily") : "Arial",
//         fontSize: isText ? activeObject.get("fontSize") : 40,
//         fontWeight: isText ? activeObject.get("fontWeight") : "normal",
//         textAlign: isText ? activeObject.get("textAlign") : "left",
//         textDecoration: getDecoration(activeObject),
//         borderRadius: isRect ? activeObject.get("rx") || 0 : 0,
//       });
//     }
//   }, [activeObject]);

//   // Effect to APPLY changes whenever the user modifies a property
//   useEffect(() => {
//     if (!activeObject || !canvas) return;

//     // Don't apply changes on the initial population of the form
//     if (isInitialLoad.current) {
//       isInitialLoad.current = false;
//       return;
//     }

//     // Apply generic properties to all objects
//     activeObject.set({
//       fill: properties.fill,
//       stroke: properties.stroke,
//       strokeWidth: parseInt(properties.strokeWidth, 10) || 0,
//       opacity: parseFloat(properties.opacity) || 0,
//     });

//     // ✨ FIX: Only apply rectangle-specific properties to rectangles
//     if (activeObject.type === "rect") {
//       activeObject.set({
//         rx: parseInt(properties.borderRadius, 10) || 0,
//         ry: parseInt(properties.borderRadius, 10) || 0,
//       });
//     }

//     // ✨ FIX: Only apply text-specific properties to textboxes
//     if (activeObject.type === "textbox") {
//       activeObject.set({
//         fontFamily: properties.fontFamily,
//         fontSize: parseInt(properties.fontSize, 10) || 40,
//         fontWeight: properties.fontWeight,
//         textAlign: properties.textAlign,
//         underline: properties.textDecoration === "underline",
//         linethrough: properties.textDecoration === "line-through",
//         overline: properties.textDecoration === "overline",
//       });
//     }

//     canvas.requestRenderAll();
//     saveState();
//   }, [properties, activeObject, canvas, saveState]);

//   // Helper function to get text decoration style from an object
//   const getDecoration = (obj) => {
//     if (!obj || obj.type !== "textbox") return "normal";
//     if (obj.get("underline")) return "underline";
//     if (obj.get("linethrough")) return "line-through";
//     if (obj.get("overline")) return "overline";
//     return "normal";
//   };

//   // Generic handler for all property input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProperties((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handlers for canvas-specific properties
//   const handleCanvasBgChange = (e) => {
//     if (!canvas) return;
//     const color = e.target.value;
//     setCanvasBgColor(color);
//     canvas.backgroundColor = color;
//     canvas.requestRenderAll();
//     saveState();
//   };

//   // Check object type for conditional rendering
//   const isTextObject = activeObject?.type === "textbox";
//   const isRect = activeObject?.type === "rect";

//   function fitToParent(parentWidth, parentHeight, aspectWidth, aspectHeight) {
//     const aspectRatio = aspectWidth / aspectHeight;

//     let width = parentWidth;
//     let height = width / aspectRatio;

//     if (height > parentHeight) {
//       height = parentHeight;
//       width = height * aspectRatio;
//     }

//     return { width, height };
//   }

//   return (
//     <aside className="properties-panel">
//       {/* Canvas Properties - Always visible */}
//       <div className="property-section">
//         <h3>Canvas</h3>
//         <div className="property-row">
//           <label htmlFor="canvas-bg-color">Background</label>
//           <input
//             id="canvas-bg-color"
//             type="color"
//             value={canvasBgColor}
//             onChange={handleCanvasBgChange}
//           />
//         </div>
//       </div>

//       <div className="toolbar-separator" style={{ margin: "1.5rem 0" }} />

//       {/* ✨ FIX: Restructured to show either object properties or a message */}
//       {activeObject ? (
//         <div className="property-section">
//           <h3>Object</h3>
//           {/* Generic Properties */}
//           <div className="property-row">
//             <label>Fill</label>
//             <input
//               type="color"
//               name="fill"
//               value={properties.fill}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div className="property-row">
//             <label>Stroke</label>
//             <input
//               type="color"
//               name="stroke"
//               value={properties.stroke}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div className="property-row">
//             <label>Stroke Width</label>
//             <input
//               type="number"
//               name="strokeWidth"
//               value={properties.strokeWidth}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div className="property-row">
//             <label>Opacity</label>
//             <input
//               type="range"
//               name="opacity"
//               min="0"
//               max="1"
//               step="0.01"
//               value={properties.opacity}
//               onChange={handleInputChange}
//             />
//           </div>

//           {/* Rectangle-Specific Properties */}
//           {isRect && (
//             <div className="property-row">
//               <label>Border Radius</label>
//               <input
//                 type="number"
//                 name="borderRadius"
//                 value={properties.borderRadius}
//                 onChange={handleInputChange}
//               />
//             </div>
//           )}

//           {/* Text-Specific Properties */}
//           {isTextObject && (
//             <>
//               <div className="property-row">
//                 <label>Font</label>
//                 <select
//                   name="fontFamily"
//                   value={properties.fontFamily}
//                   onChange={handleInputChange}
//                 >
//                   <option>Arial</option>
//                   <option>Times New Roman</option>
//                   <option>Courier New</option>
//                   <option>Georgia</option>
//                   <option>Verdana</option>
//                 </select>
//               </div>
//               <div className="property-row">
//                 <label>Font Size</label>
//                 <input
//                   type="number"
//                   name="fontSize"
//                   value={properties.fontSize}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="property-row">
//                 <label>Weight</label>
//                 <select
//                   name="fontWeight"
//                   value={properties.fontWeight}
//                   onChange={handleInputChange}
//                 >
//                   <option value="normal">Normal</option>
//                   <option value="bold">Bold</option>
//                 </select>
//               </div>
//               <div className="property-row">
//                 <label>Align</label>
//                 <select
//                   name="textAlign"
//                   value={properties.textAlign}
//                   onChange={handleInputChange}
//                 >
//                   <option>left</option>
//                   <option>center</option>
//                   <option>right</option>
//                   <option>justify</option>
//                 </select>
//               </div>
//               <div className="property-row">
//                 <label>Decoration</label>
//                 <select
//                   name="textDecoration"
//                   value={properties.textDecoration}
//                   onChange={handleInputChange}
//                 >
//                   <option>normal</option>
//                   <option>underline</option>
//                   <option>line-through</option>
//                   <option>overline</option>
//                 </select>
//               </div>
//             </>
//           )}
//         </div>
//       ) : (
//         <div
//           style={{ padding: "0 1rem", color: "#64748b", textAlign: "center" }}
//         >
//           Select an object to see its properties.
//         </div>
//       )}
//     </aside>
//   );
// };

// export default RightPropertiesPanel;

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
  const { canvas, activeObject, saveState } = useStore();
  const [props, setProps] = useState(defaultProperties);

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

  const handleChange = (name, value) => {
    if (!activeObject || !canvas) return;

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
    activeObject.set(update);
    canvas.requestRenderAll();
    saveState();
  };

  const isTextObject = activeObject?.type === "textbox";
  const isShape =
    activeObject && ["rect", "circle", "triangle"].includes(activeObject.type);

  return (
    <div className="properties-panel">
      {activeObject ? (
        <div>
          <h3>Properties</h3>

          {/* Generic Properties */}
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
