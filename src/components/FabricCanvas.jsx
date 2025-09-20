// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useStore } from "../store";
// import { fabric } from "fabric";
// import ContextMenu from "./ContextMenu";
// import * as FaIcons from "react-icons/fa";

// const FabricCanvas = () => {
//   const canvasRef = useRef(null);
//   const wrapperRef = useRef(null);
//   // ✅ UPDATED: Using the correct state and actions for the new tool
//   const {
//     setCanvas,
//     saveState,
//     setActiveObject,
//     canvas, // Renamed for consistency, but fabricCanvas is also fine
//     isColorPickerActive,
//     setIsColorPickerActive,
//     pickedColor,
//     setPickedColor,
//     historyTimestamp,
//   } = useStore();

//   const [contextMenu, setContextMenu] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     target: null,
//   });

//   const updateCanvasViewRef = useRef(null);

//   const handleCloseContextMenu = useCallback(() => {
//     setContextMenu((prev) => ({ ...prev, visible: false }));
//   }, []);

//   const updateCanvasView = useCallback(() => {
//     if (!canvas || !wrapperRef.current) return;
//     const canvasWidth = canvas.getWidth();
//     const canvasHeight = canvas.getHeight();
//     const containerWidth = wrapperRef.current.clientWidth;
//     const containerHeight = wrapperRef.current.clientHeight;
//     const scale = Math.min(
//       containerWidth / canvasWidth,
//       containerHeight / canvasHeight
//     );
//     canvas.setZoom(scale);
//     const panX = (containerWidth - canvasWidth * scale) / 2;
//     const panY = (containerHeight - canvasHeight * scale) / 2;
//     canvas.viewportTransform[4] = panX;
//     canvas.viewportTransform[5] = panY;
//     canvas.renderAll();
//   }, [canvas]);

//   useEffect(() => {
//     updateCanvasViewRef.current = updateCanvasView;
//   });

//   useEffect(() => {
//     updateCanvasViewRef.current();
//   }, [historyTimestamp]);

//   useEffect(() => {
//     const canvasInstance = new fabric.Canvas(canvasRef.current, {
//       width: wrapperRef.current?.clientWidth,
//       height: wrapperRef.current?.clientHeight,
//       preserveObjectStacking: true,
//     });

//     // Snapping setup (unchanged)
//     const snapThreshold = 5;
//     let guideLines = [];
//     const clearGuides = () => {
//       guideLines.forEach((line) => canvasInstance.remove(line));
//       guideLines = [];
//     };
//     const addGuide = (x1, y1, x2, y2) => {
//       const line = new fabric.Line([x1, y1, x2, y2], {
//         stroke: "rgba(0, 162, 255, 0.7)",
//         selectable: false,
//         evented: false,
//         strokeWidth: 1,
//       });
//       canvasInstance.add(line);
//       guideLines.push(line);
//     };
//     canvasInstance.on("object:moving", (e) => {
//       const obj = e.target;
//       if (!obj) return;
//       clearGuides();
//       const objLeft = obj.left;
//       const objTop = obj.top;
//       const objRight = obj.left + obj.getScaledWidth();
//       const objBottom = obj.top + obj.getScaledHeight();
//       const objCenterX = obj.left + obj.getScaledWidth() / 2;
//       const objCenterY = obj.top + obj.getScaledHeight() / 2;
//       const canvasW = canvasInstance.getWidth();
//       const canvasH = canvasInstance.getHeight();
//       const canvasCenterX = canvasW / 2;
//       const canvasCenterY = canvasH / 2;
//       const margin = 25;
//       if (Math.abs(objLeft - margin) < snapThreshold) {
//         obj.left = margin;
//         addGuide(margin, 0, margin, canvasH);
//       }
//       if (Math.abs(objRight - (canvasW - margin)) < snapThreshold) {
//         obj.left = canvasW - margin - obj.getScaledWidth();
//         addGuide(canvasW - margin, 0, canvasW - margin, canvasH);
//       }
//       if (Math.abs(objTop - margin) < snapThreshold) {
//         obj.top = margin;
//         addGuide(0, margin, canvasW, margin);
//       }
//       if (Math.abs(objBottom - (canvasH - margin)) < snapThreshold) {
//         obj.top = canvasH - margin - obj.getScaledHeight();
//         addGuide(0, canvasH - margin, canvasW, canvasH - margin);
//       }
//       if (Math.abs(objLeft) < snapThreshold) {
//         obj.left = 0;
//         addGuide(0, 0, 0, canvasH);
//       }
//       if (Math.abs(objRight - canvasW) < snapThreshold) {
//         obj.left = canvasW - obj.getScaledWidth();
//         addGuide(canvasW, 0, canvasW, canvasH);
//       }
//       if (Math.abs(objTop) < snapThreshold) {
//         obj.top = 0;
//         addGuide(0, 0, canvasW, 0);
//       }
//       if (Math.abs(objBottom - canvasH) < snapThreshold) {
//         obj.top = canvasH - obj.getScaledHeight();
//         addGuide(0, canvasH, canvasW, canvasH);
//       }
//       if (Math.abs(objCenterX - canvasCenterX) < snapThreshold) {
//         obj.left = canvasCenterX - obj.getScaledWidth() / 2;
//         addGuide(canvasCenterX, 0, canvasCenterX, canvasH);
//       }
//       if (Math.abs(objCenterY - canvasCenterY) < snapThreshold) {
//         obj.top = canvasCenterY - obj.getScaledHeight() / 2;
//         addGuide(0, canvasCenterY, canvasW, canvasCenterY);
//       }
//       const objects = canvasInstance.getObjects().filter((o) => o !== obj);
//       objects.forEach((o) => {
//         const oLeft = o.left;
//         const oTop = o.top;
//         const oRight = o.left + o.getScaledWidth();
//         const oBottom = o.top + o.getScaledHeight();
//         const oCenterX = o.left + o.getScaledWidth() / 2;
//         const oCenterY = o.top + o.getScaledHeight() / 2;
//         if (Math.abs(objLeft - oLeft) < snapThreshold) {
//           obj.left = oLeft;
//           addGuide(oLeft, 0, oLeft, canvasH);
//         }
//         if (Math.abs(objRight - oRight) < snapThreshold) {
//           obj.left = oRight - obj.getScaledWidth();
//           addGuide(oRight, 0, oRight, canvasH);
//         }
//         if (Math.abs(objTop - oTop) < snapThreshold) {
//           obj.top = oTop;
//           addGuide(0, oTop, canvasW, oTop);
//         }
//         if (Math.abs(objBottom - oBottom) < snapThreshold) {
//           obj.top = oBottom - obj.getScaledHeight();
//           addGuide(0, oBottom, canvasW, oBottom);
//         }
//         if (Math.abs(objCenterX - oCenterX) < snapThreshold) {
//           obj.left = oCenterX - obj.getScaledWidth() / 2;
//           addGuide(oCenterX, 0, oCenterX, canvasH);
//         }
//         if (Math.abs(objCenterY - oCenterY) < snapThreshold) {
//           obj.top = oCenterY - obj.getScaledHeight() / 2;
//           addGuide(0, oCenterY, canvasW, oCenterY);
//         }
//       });
//     });
//     canvasInstance.on("object:modified", clearGuides);
//     canvasInstance.on("selection:cleared", clearGuides);

//     // Drop handler (unchanged)
//     const handleDrop = (e) => {
//       e.preventDefault();
//       if (!canvasInstance) return;
//       const file = e.dataTransfer?.files?.[0];
//       if (!file || !file.type.startsWith("image/")) return;
//       const fakeEvent = {
//         clientX: e.clientX,
//         clientY: e.clientY,
//         target: canvasInstance.upperCanvasEl,
//       };
//       const targetShape = canvasInstance.findTarget(fakeEvent, false);
//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         const dataUrl = ev.target.result;
//         const imgEl = new Image();
//         imgEl.onload = () => {
//           const imgW = imgEl.naturalWidth;
//           const imgH = imgEl.naturalHeight;
//           if (
//             targetShape &&
//             ["rect", "circle", "triangle"].includes(targetShape.type)
//           ) {
//             const shapeW = Math.round(targetShape.getScaledWidth());
//             const shapeH = Math.round(targetShape.getScaledHeight());
//             if (shapeW === 0 || shapeH === 0) return;
//             const tempCanvas = document.createElement("canvas");
//             tempCanvas.width = shapeW;
//             tempCanvas.height = shapeH;
//             const ctx = tempCanvas.getContext("2d");
//             const imageAspect = imgW / imgH;
//             const shapeAspect = shapeW / shapeH;
//             let renderW, renderH, x, y;
//             if (imageAspect >= shapeAspect) {
//               renderH = shapeH;
//               renderW = Math.round(imgW * (renderH / imgH));
//               x = Math.round((shapeW - renderW) / 2);
//               y = 0;
//             } else {
//               renderW = shapeW;
//               renderH = Math.round(imgH * (renderW / imgW));
//               x = 0;
//               y = Math.round((shapeH - renderH) / 2);
//             }
//             ctx.drawImage(imgEl, x, y, renderW, renderH);
//             const pattern = new fabric.Pattern({
//               source: tempCanvas,
//               repeat: "no-repeat",
//             });
//             targetShape.set("fill", pattern);
//             canvasInstance.requestRenderAll();
//             saveState?.();
//           } else {
//             fabric.Image.fromURL(dataUrl, (fImg) => {
//               const pointer = canvasInstance.getPointer(fakeEvent);
//               fImg.set({
//                 left: pointer.x,
//                 top: pointer.y,
//                 originX: "center",
//                 originY: "center",
//               });
//               fImg.scaleToWidth(200);
//               canvasInstance.add(fImg).setActiveObject(fImg);
//               canvasInstance.requestRenderAll();
//               saveState?.();
//             });
//           }
//         };
//         imgEl.onerror = (err) => {
//           console.error("Image load error:", err);
//         };
//         imgEl.src = dataUrl;
//       };
//       reader.readAsDataURL(file);
//     };

//     // Other setup (unchanged)
//     const updateActiveObject = () =>
//       setActiveObject(canvasInstance.getActiveObject());
//     canvasInstance.on({
//       "selection:created": updateActiveObject,
//       "selection:updated": updateActiveObject,
//       "selection:cleared": updateActiveObject,
//       "object:added": saveState,
//       "object:removed": saveState,
//       "mouse:up": saveState,
//     });
//     const handleContextMenu = (e) => {
//       e.preventDefault();
//       const target = canvasInstance.findTarget(e, false);
//       setContextMenu({
//         visible: true,
//         x: e.clientX,
//         y: e.clientY,
//         target: target,
//       });
//     };
//     const canvasContainer = wrapperRef.current;
//     const handleDragOver = (e) => e.preventDefault();
//     canvasContainer.addEventListener("contextmenu", handleContextMenu);
//     canvasContainer.addEventListener("dragover", handleDragOver);
//     canvasContainer.addEventListener("drop", handleDrop);
//     const initialState = useStore.getState().pages[0].undoStack[0];
//     canvasInstance.loadFromJSON(initialState, () => {
//       canvasInstance.renderAll();
//       updateCanvasViewRef.current();
//     });
//     setCanvas(canvasInstance);
//     const resizeObserver = new ResizeObserver(() => {
//       if (wrapperRef.current) {
//         canvasInstance.setWidth(wrapperRef.current.clientWidth);
//         canvasInstance.setHeight(wrapperRef.current.clientHeight);
//         updateCanvasViewRef.current();
//       }
//     });
//     if (wrapperRef.current) {
//       resizeObserver.observe(wrapperRef.current);
//     }
//     return () => {
//       canvasContainer.removeEventListener("contextmenu", handleContextMenu);
//       canvasContainer.removeEventListener("dragover", handleDragOver);
//       canvasContainer.removeEventListener("drop", handleDrop);
//       if (wrapperRef.current) {
//         resizeObserver.unobserve(wrapperRef.current);
//       }
//       if (canvasInstance) {
//         canvasInstance.dispose();
//       }
//       setCanvas(null);
//     };
//   }, [saveState, setActiveObject, setCanvas]);

//   // ✅ =================================================================
//   // ✅ NEW EFFECT FOR THE "PICK AND PASTE" COLOR PICKER TOOL
//   // ✅ =================================================================
//   useEffect(() => {
//     if (!canvas) return;

//     // This function handles the main logic
//     const handleMouseDown = (e) => {
//       // We only do something if a shape is clicked
//       if (!e.target) return;

//       // --- 1. PICKING a color ---
//       if (pickedColor === null) {
//         const sourceColor = e.target.get("fill");
//         setPickedColor(sourceColor); // Save the picked color

//         // --- 2. PASTING a color ---
//       } else {
//         e.target.set("fill", pickedColor); // Apply the saved color
//         canvas.requestRenderAll();
//         saveState(); // Save the change

//         // --- 3. RESET the tool ---
//         setPickedColor(null);
//         setIsColorPickerActive(false);
//       }
//     };

//     // When the tool is activated...
//     if (isColorPickerActive) {
//       canvas.defaultCursor = "crosshair"; // Change the mouse pointer
//       canvas.selection = false; // Disable selecting/dragging objects
//       canvas.forEachObject((obj) => obj.set("selectable", false));
//       canvas.on("mouse:down", handleMouseDown);

//       // When the tool is deactivated...
//     } else {
//       canvas.defaultCursor = "default"; // Change pointer back to normal
//       canvas.selection = true; // Re-enable selecting/dragging
//       canvas.forEachObject((obj) => obj.set("selectable", true));
//       canvas.off("mouse:down", handleMouseDown); // Stop listening for clicks
//     }

//     // Cleanup function to be safe
//     return () => {
//       if (canvas) {
//         canvas.off("mouse:down", handleMouseDown);
//         canvas.defaultCursor = "default";
//         canvas.selection = true;
//         canvas.forEachObject((obj) => obj.set("selectable", true));
//       }
//     };
//   }, [
//     isColorPickerActive,
//     pickedColor,
//     canvas,
//     setPickedColor,
//     setIsColorPickerActive,
//     saveState,
//   ]);

//   return (
//     <div
//       ref={wrapperRef}
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "#2a2a2a",
//       }}
//     >
//       <canvas
//         ref={canvasRef}
//         style={{
//           background: "#ffffff",
//           border: "1px solid #000000ff",
//         }}
//       />
//       {contextMenu.visible && (
//         <ContextMenu
//           x={contextMenu.x}
//           y={contextMenu.y}
//           target={contextMenu.target}
//           onClose={handleCloseContextMenu}
//         />
//       )}
//     </div>
//   );
// };

// export default FabricCanvas;

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
import ContextMenu from "./ContextMenu";

const FabricCanvas = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const {
    setCanvas,
    saveState,
    setActiveObject,
    canvas,
    isColorPickerActive,
    setIsColorPickerActive,
    pickedColor,
    setPickedColor,
    historyTimestamp,
  } = useStore();

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: null,
  });

  const updateCanvasViewRef = useRef(null);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const updateCanvasView = useCallback(() => {
    if (!canvas || !wrapperRef.current) return;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const containerWidth = wrapperRef.current.clientWidth;
    const containerHeight = wrapperRef.current.clientHeight;
    const scale = Math.min(
      containerWidth / canvasWidth,
      containerHeight / canvasHeight,
      1
    );
    canvas.setZoom(scale);
    const panX = (containerWidth - canvasWidth * scale) / 2;
    const panY = (containerHeight - canvasHeight * scale) / 2;
    canvas.viewportTransform[4] = panX;
    canvas.viewportTransform[5] = panY;
    canvas.renderAll();
  }, [canvas]);

  useEffect(() => {
    updateCanvasViewRef.current = updateCanvasView;
  });

  useEffect(() => {
    updateCanvasViewRef.current();
  }, [historyTimestamp]);

  useEffect(() => {
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: wrapperRef.current?.clientWidth,
      height: wrapperRef.current?.clientHeight,
      preserveObjectStacking: true,
    });

    // --- Snapping Logic ---
    const snapThreshold = 5;
    let guideLines = [];
    const clearGuides = () => {
      guideLines.forEach((line) => canvasInstance.remove(line));
      guideLines = [];
    };
    const addGuide = (x1, y1, x2, y2) => {
      const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: "rgba(0, 162, 255, 0.7)",
        selectable: false,
        evented: false,
        strokeWidth: 1,
      });
      canvasInstance.add(line);
      guideLines.push(line);
    };
    canvasInstance.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;
      clearGuides();
      const objLeft = obj.left;
      const objTop = obj.top;
      const objRight = obj.left + obj.getScaledWidth();
      const objBottom = obj.top + obj.getScaledHeight();
      const objCenterX = obj.left + obj.getScaledWidth() / 2;
      const objCenterY = obj.top + obj.getScaledHeight() / 2;
      const canvasW = canvasInstance.getWidth();
      const canvasH = canvasInstance.getHeight();
      const canvasCenterX = canvasW / 2;
      const canvasCenterY = canvasH / 2;
      const margin = 25;
      if (Math.abs(objLeft - margin) < snapThreshold) {
        obj.left = margin;
        addGuide(margin, 0, margin, canvasH);
      }
      if (Math.abs(objRight - (canvasW - margin)) < snapThreshold) {
        obj.left = canvasW - margin - obj.getScaledWidth();
        addGuide(canvasW - margin, 0, canvasW - margin, canvasH);
      }
      if (Math.abs(objTop - margin) < snapThreshold) {
        obj.top = margin;
        addGuide(0, margin, canvasW, margin);
      }
      if (Math.abs(objBottom - (canvasH - margin)) < snapThreshold) {
        obj.top = canvasH - margin - obj.getScaledHeight();
        addGuide(0, canvasH - margin, canvasW, canvasH - margin);
      }
      if (Math.abs(objLeft) < snapThreshold) {
        obj.left = 0;
        addGuide(0, 0, 0, canvasH);
      }
      if (Math.abs(objRight - canvasW) < snapThreshold) {
        obj.left = canvasW - obj.getScaledWidth();
        addGuide(canvasW, 0, canvasW, canvasH);
      }
      if (Math.abs(objTop) < snapThreshold) {
        obj.top = 0;
        addGuide(0, 0, canvasW, 0);
      }
      if (Math.abs(objBottom - canvasH) < snapThreshold) {
        obj.top = canvasH - obj.getScaledHeight();
        addGuide(0, canvasH, canvasW, canvasH);
      }
      if (Math.abs(objCenterX - canvasCenterX) < snapThreshold) {
        obj.left = canvasCenterX - obj.getScaledWidth() / 2;
        addGuide(canvasCenterX, 0, canvasCenterX, canvasH);
      }
      if (Math.abs(objCenterY - canvasCenterY) < snapThreshold) {
        obj.top = canvasCenterY - obj.getScaledHeight() / 2;
        addGuide(0, canvasCenterY, canvasW, canvasCenterY);
      }
      const objects = canvasInstance.getObjects().filter((o) => o !== obj);
      objects.forEach((o) => {
        const oLeft = o.left;
        const oTop = o.top;
        const oRight = o.left + o.getScaledWidth();
        const oBottom = o.top + o.getScaledHeight();
        const oCenterX = o.left + o.getScaledWidth() / 2;
        const oCenterY = o.top + o.getScaledHeight() / 2;
        if (Math.abs(objLeft - oLeft) < snapThreshold) {
          obj.left = oLeft;
          addGuide(oLeft, 0, oLeft, canvasH);
        }
        if (Math.abs(objRight - oRight) < snapThreshold) {
          obj.left = oRight - obj.getScaledWidth();
          addGuide(oRight, 0, oRight, canvasH);
        }
        if (Math.abs(objTop - oTop) < snapThreshold) {
          obj.top = oTop;
          addGuide(0, oTop, canvasW, oTop);
        }
        if (Math.abs(objBottom - oBottom) < snapThreshold) {
          obj.top = oBottom - obj.getScaledHeight();
          addGuide(0, oBottom, canvasW, oBottom);
        }
        if (Math.abs(objCenterX - oCenterX) < snapThreshold) {
          obj.left = oCenterX - obj.getScaledWidth() / 2;
          addGuide(oCenterX, 0, oCenterX, canvasH);
        }
        if (Math.abs(objCenterY - oCenterY) < snapThreshold) {
          obj.top = oCenterY - obj.getScaledHeight() / 2;
          addGuide(0, oCenterY, canvasW, oCenterY);
        }
      });
    });

    // ✅ BUG FIX: The problematic 'before:render' and 'after:render' listeners have been removed.
    // 'object:modified' is a better event for clearing guides after a move is complete.
    canvasInstance.on("object:modified", clearGuides);
    canvasInstance.on("selection:cleared", clearGuides);

    // --- Drag and Drop Logic (No Changes) ---
    const handleDrop = (e) => {
      e.preventDefault();
      if (!canvasInstance) return;
      const file = e.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const fakeEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        target: canvasInstance.upperCanvasEl,
      };
      const targetShape = canvasInstance.findTarget(fakeEvent, false);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const imgEl = new Image();
        imgEl.onload = () => {
          const imgW = imgEl.naturalWidth;
          const imgH = imgEl.naturalHeight;
          if (
            targetShape &&
            ["rect", "circle", "triangle"].includes(targetShape.type)
          ) {
            const shapeW = Math.round(targetShape.getScaledWidth());
            const shapeH = Math.round(targetShape.getScaledHeight());
            if (shapeW === 0 || shapeH === 0) return;
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = shapeW;
            tempCanvas.height = shapeH;
            const ctx = tempCanvas.getContext("2d");
            const imageAspect = imgW / imgH;
            const shapeAspect = shapeW / shapeH;
            let renderW, renderH, x, y;
            if (imageAspect >= shapeAspect) {
              renderH = shapeH;
              renderW = Math.round(imgW * (renderH / imgH));
              x = Math.round((shapeW - renderW) / 2);
              y = 0;
            } else {
              renderW = shapeW;
              renderH = Math.round(imgH * (renderW / imgW));
              x = 0;
              y = Math.round((shapeH - renderH) / 2);
            }
            ctx.drawImage(imgEl, x, y, renderW, renderH);
            const pattern = new fabric.Pattern({
              source: tempCanvas,
              repeat: "no-repeat",
            });
            targetShape.set("fill", pattern);
            canvasInstance.requestRenderAll();
            saveState?.();
          } else {
            fabric.Image.fromURL(dataUrl, (fImg) => {
              const pointer = canvasInstance.getPointer(fakeEvent);
              fImg.set({
                left: pointer.x,
                top: pointer.y,
                originX: "center",
                originY: "center",
              });
              fImg.scaleToWidth(200);
              canvasInstance.add(fImg).setActiveObject(fImg);
              canvasInstance.requestRenderAll();
              saveState?.();
            });
          }
        };
        imgEl.onerror = (err) => {
          console.error("Image load error:", err);
        };
        imgEl.src = dataUrl;
      };
      reader.readAsDataURL(file);
    };

    // --- Standard Event Listeners (No Changes) ---
    const updateActiveObject = () =>
      setActiveObject(canvasInstance.getActiveObject());

    canvasInstance.on({
      "selection:created": updateActiveObject,
      "selection:updated": updateActiveObject,
      "selection:cleared": updateActiveObject,
      "object:added": saveState,
      "object:removed": saveState,
      "mouse:up": saveState,
    });

    const handleContextMenu = (e) => {
      e.preventDefault();
      const target = canvasInstance.findTarget(e, false);
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        target: target,
      });
    };

    const canvasContainer = wrapperRef.current;
    const handleDragOver = (e) => e.preventDefault();
    canvasContainer.addEventListener("contextmenu", handleContextMenu);
    canvasContainer.addEventListener("dragover", handleDragOver);
    canvasContainer.addEventListener("drop", handleDrop);

    // --- Initial Load Logic (No Changes from previous fix) ---
    const state = useStore.getState();
    const initialState =
      state.pages[state.activePageIndex].undoStack.slice(-1)[0];

    canvasInstance.loadFromJSON(initialState, () => {
      canvasInstance.renderAll();
      updateCanvasViewRef.current();
    });

    setCanvas(canvasInstance);

    // --- Resize Observer (No Changes) ---
    const resizeObserver = new ResizeObserver(() => {
      if (wrapperRef.current && canvasInstance) {
        if (updateCanvasViewRef.current) {
          updateCanvasViewRef.current();
        }
      }
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    // --- Cleanup Function (No Changes) ---
    return () => {
      canvasContainer.removeEventListener("contextmenu", handleContextMenu);
      canvasContainer.removeEventListener("dragover", handleDragOver);
      canvasContainer.removeEventListener("drop", handleDrop);
      if (wrapperRef.current) {
        resizeObserver.unobserve(wrapperRef.current);
      }
      if (canvasInstance) {
        canvasInstance.dispose();
      }
      setCanvas(null);
    };
  }, [saveState, setActiveObject, setCanvas]);

  // --- Color Picker useEffect (No Changes) ---
  useEffect(() => {
    if (!canvas) return;
    const handleMouseDown = (e) => {
      if (!e.target) return;
      if (pickedColor === null) {
        const sourceColor = e.target.get("fill");
        setPickedColor(sourceColor);
      } else {
        e.target.set("fill", pickedColor);
        canvas.requestRenderAll();
        saveState();
        setPickedColor(null);
        setIsColorPickerActive(false);
      }
    };
    if (isColorPickerActive) {
      canvas.defaultCursor = "crosshair";
      canvas.selection = false;
      canvas.forEachObject((obj) => obj.set("selectable", false));
      canvas.on("mouse:down", handleMouseDown);
    } else {
      canvas.defaultCursor = "default";
      canvas.selection = true;
      canvas.forEachObject((obj) => obj.set("selectable", true));
      canvas.off("mouse:down", handleMouseDown);
    }
    return () => {
      if (canvas) {
        canvas.off("mouse:down", handleMouseDown);
        canvas.defaultCursor = "default";
        canvas.selection = true;
        canvas.forEachObject((obj) => obj.set("selectable", true));
      }
    };
  }, [
    isColorPickerActive,
    pickedColor,
    canvas,
    setPickedColor,
    setIsColorPickerActive,
    saveState,
  ]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2a2a2a",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          background: "#ffffff",
          // boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
        }}
      />
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};

export default FabricCanvas;
