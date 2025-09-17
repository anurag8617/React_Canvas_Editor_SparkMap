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
    canvas: fabricCanvas,
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
    if (!fabricCanvas || !wrapperRef.current) return;
    const canvasWidth = fabricCanvas.getWidth();
    const canvasHeight = fabricCanvas.getHeight();
    const containerWidth = wrapperRef.current.clientWidth;
    const containerHeight = wrapperRef.current.clientHeight;
    const scale = Math.min(
      containerWidth / canvasWidth,
      containerHeight / canvasHeight
    );
    fabricCanvas.setZoom(scale);
    const panX = (containerWidth - canvasWidth * scale) / 2;
    const panY = (containerHeight - canvasHeight * scale) / 2;
    fabricCanvas.viewportTransform[4] = panX;
    fabricCanvas.viewportTransform[5] = panY;
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

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

    // -----------------------------
    // 🔹 Snapping setup
    // -----------------------------
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

      // --- Snap to canvas edges + center ---
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

      // --- Snap to other objects ---
      const objects = canvasInstance.getObjects().filter((o) => o !== obj);
      objects.forEach((o) => {
        const oLeft = o.left;
        const oTop = o.top;
        const oRight = o.left + o.getScaledWidth();
        const oBottom = o.top + o.getScaledHeight();
        const oCenterX = o.left + o.getScaledWidth() / 2;
        const oCenterY = o.top + o.getScaledHeight() / 2;

        // Left edge
        if (Math.abs(objLeft - oLeft) < snapThreshold) {
          obj.left = oLeft;
          addGuide(oLeft, 0, oLeft, canvasH);
        }
        // Right edge
        if (Math.abs(objRight - oRight) < snapThreshold) {
          obj.left = oRight - obj.getScaledWidth();
          addGuide(oRight, 0, oRight, canvasH);
        }
        // Top edge
        if (Math.abs(objTop - oTop) < snapThreshold) {
          obj.top = oTop;
          addGuide(0, oTop, canvasW, oTop);
        }
        // Bottom edge
        if (Math.abs(objBottom - oBottom) < snapThreshold) {
          obj.top = oBottom - obj.getScaledHeight();
          addGuide(0, oBottom, canvasW, oBottom);
        }
        // Center X
        if (Math.abs(objCenterX - oCenterX) < snapThreshold) {
          obj.left = oCenterX - obj.getScaledWidth() / 2;
          addGuide(oCenterX, 0, oCenterX, canvasH);
        }
        // Center Y
        if (Math.abs(objCenterY - oCenterY) < snapThreshold) {
          obj.top = oCenterY - obj.getScaledHeight() / 2;
          addGuide(0, oCenterY, canvasW, oCenterY);
        }
      });
    });

    canvasInstance.on("object:modified", clearGuides);
    canvasInstance.on("selection:cleared", clearGuides);

    // -----------------------------
    // ✅ Drop handler
    // -----------------------------
    const handleDrop = (e) => {
      e.preventDefault();
      if (!canvasInstance) return;

      const file = e.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const rect = canvasInstance.upperCanvasEl.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      const fakeEvent = {
        clientX,
        clientY,
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

    // -----------------------------
    // ✅ Other setup
    // -----------------------------
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

    const initialState = useStore.getState().pages[0].undoStack[0];
    canvasInstance.loadFromJSON(initialState, () => {
      canvasInstance.renderAll();
      updateCanvasViewRef.current();
    });
    setCanvas(canvasInstance);

    const resizeObserver = new ResizeObserver(() => {
      if (wrapperRef.current) {
        canvasInstance.setWidth(wrapperRef.current.clientWidth);
        canvasInstance.setHeight(wrapperRef.current.clientHeight);
        updateCanvasViewRef.current();
      }
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

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

  // return (
  //   <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
  //     <canvas ref={canvasRef} />
  //     {contextMenu.visible && (
  //       <ContextMenu
  //         x={contextMenu.x}
  //         y={contextMenu.y}
  //         target={contextMenu.target}
  //         onClose={handleCloseContextMenu}
  //       />
  //     )}
  //   </div>
  // );
  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2a2a2a", // dark/gray workspace background
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          background: "#fffff", // 🔹 only the canvas area is white
          border: "1px solid #000000ff",
          // border: "0 0 10px rgba(0,0,0,0.2)", // nice shadow effect
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

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useStore } from "../store";
// import { fabric } from "fabric";
// import ContextMenu from "./ContextMenu";

// const FabricCanvas = () => {
//   const canvasRef = useRef(null);
//   const wrapperRef = useRef(null);

//   const {
//     setCanvas,
//     saveState,
//     setActiveObject,
//     canvas: fabricCanvas,
//     pages,
//     activePageIndex,
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

//   // 🔹 Fit the canvas to the wrapper but keep page aspect ratio
//   const updateCanvasView = useCallback(() => {
//     if (!fabricCanvas || !wrapperRef.current) return;
//     const page = pages[activePageIndex];
//     if (!page) return;

//     const canvasWidth = fabricCanvas.getWidth();
//     const canvasHeight = fabricCanvas.getHeight();
//     const containerWidth = wrapperRef.current.clientWidth;
//     const containerHeight = wrapperRef.current.clientHeight;

//     const scale = Math.min(
//       containerWidth / canvasWidth,
//       containerHeight / canvasHeight
//     );
//     fabricCanvas.setZoom(scale);

//     const panX = (containerWidth - canvasWidth * scale) / 2;
//     const panY = (containerHeight - canvasHeight * scale) / 2;
//     fabricCanvas.viewportTransform[4] = panX;
//     fabricCanvas.viewportTransform[5] = panY;

//     fabricCanvas.requestRenderAll();
//   }, [fabricCanvas, pages, activePageIndex]);

//   useEffect(() => {
//     updateCanvasViewRef.current = updateCanvasView;
//   });

//   useEffect(() => {
//     updateCanvasViewRef.current();
//   }, [historyTimestamp, updateCanvasView]);

//   useEffect(() => {
//     if (!canvasRef.current || !wrapperRef.current) return;

//     const page = pages[activePageIndex];
//     if (!page) return;

//     const canvasInstance = new fabric.Canvas(canvasRef.current, {
//       width: page?.undoStack[0]?.width || 800,
//       height: page?.undoStack[0]?.height || 600,
//       preserveObjectStacking: true,
//       backgroundColor: "#ffffff",
//     });

//     // -----------------------------
//     // 🔹 Snapping setup
//     // -----------------------------
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

//     // Snap objects to canvas edges, center, and other objects
//     const handleObjectMove = (e) => {
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

//       // Snap to canvas edges + margin
//       if (Math.abs(objLeft - margin) < snapThreshold) obj.left = margin;
//       if (Math.abs(objRight - (canvasW - margin)) < snapThreshold)
//         obj.left = canvasW - margin - obj.getScaledWidth();
//       if (Math.abs(objTop - margin) < snapThreshold) obj.top = margin;
//       if (Math.abs(objBottom - (canvasH - margin)) < snapThreshold)
//         obj.top = canvasH - margin - obj.getScaledHeight();

//       // Snap to canvas edges and center
//       if (Math.abs(objLeft) < snapThreshold) obj.left = 0;
//       if (Math.abs(objRight - canvasW) < snapThreshold)
//         obj.left = canvasW - obj.getScaledWidth();
//       if (Math.abs(objTop) < snapThreshold) obj.top = 0;
//       if (Math.abs(objBottom - canvasH) < snapThreshold)
//         obj.top = canvasH - obj.getScaledHeight();
//       if (Math.abs(objCenterX - canvasCenterX) < snapThreshold)
//         obj.left = canvasCenterX - obj.getScaledWidth() / 2;
//       if (Math.abs(objCenterY - canvasCenterY) < snapThreshold)
//         obj.top = canvasCenterY - obj.getScaledHeight() / 2;

//       // Snap to other objects
//       canvasInstance.getObjects().forEach((o) => {
//         if (o === obj) return;
//         const oLeft = o.left;
//         const oTop = o.top;
//         const oRight = o.left + o.getScaledWidth();
//         const oBottom = o.top + o.getScaledHeight();
//         const oCenterX = o.left + o.getScaledWidth() / 2;
//         const oCenterY = o.top + o.getScaledHeight() / 2;

//         if (Math.abs(objLeft - oLeft) < snapThreshold) obj.left = oLeft;
//         if (Math.abs(objRight - oRight) < snapThreshold)
//           obj.left = oRight - obj.getScaledWidth();
//         if (Math.abs(objTop - oTop) < snapThreshold) obj.top = oTop;
//         if (Math.abs(objBottom - oBottom) < snapThreshold)
//           obj.top = oBottom - obj.getScaledHeight();
//         if (Math.abs(objCenterX - oCenterX) < snapThreshold)
//           obj.left = oCenterX - obj.getScaledWidth() / 2;
//         if (Math.abs(objCenterY - oCenterY) < snapThreshold)
//           obj.top = oCenterY - obj.getScaledHeight() / 2;
//       });

//       canvasInstance.requestRenderAll();
//     };

//     canvasInstance.on("object:moving", handleObjectMove);
//     canvasInstance.on("object:modified", clearGuides);
//     canvasInstance.on("selection:cleared", clearGuides);

//     // -----------------------------
//     // 🔹 Drag & drop images
//     // -----------------------------
//     const handleDrop = (e) => {
//       e.preventDefault();
//       const file = e.dataTransfer?.files?.[0];
//       if (!file || !file.type.startsWith("image/")) return;

//       const pointer = canvasInstance.getPointer(e);

//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         fabric.Image.fromURL(ev.target.result, (img) => {
//           img.set({
//             left: pointer.x,
//             top: pointer.y,
//             originX: "center",
//             originY: "center",
//           });
//           img.scaleToWidth(200);
//           canvasInstance.add(img).setActiveObject(img);
//           canvasInstance.requestRenderAll();
//           saveState?.();
//         });
//       };
//       reader.readAsDataURL(file);
//     };

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
//         target,
//       });
//     };

//     const canvasContainer = wrapperRef.current;
//     canvasContainer.addEventListener("contextmenu", handleContextMenu);
//     canvasContainer.addEventListener("dragover", (e) => e.preventDefault());
//     canvasContainer.addEventListener("drop", handleDrop);

//     // Load initial page state
//     const initialState = page?.undoStack[0];
//     if (initialState) {
//       canvasInstance.loadFromJSON(initialState, () => {
//         canvasInstance.requestRenderAll();
//         updateCanvasViewRef.current();
//       });
//     }

//     setCanvas(canvasInstance);

//     const resizeObserver = new ResizeObserver(() => {
//       updateCanvasViewRef.current();
//     });
//     if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

//     return () => {
//       canvasContainer.removeEventListener("contextmenu", handleContextMenu);
//       canvasContainer.removeEventListener("drop", handleDrop);
//       if (wrapperRef.current) resizeObserver.unobserve(wrapperRef.current);
//       canvasInstance.dispose();
//       setCanvas(null);
//     };
//   }, [pages, activePageIndex, saveState, setActiveObject, setCanvas]);

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

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useStore } from "../store";
// import { fabric } from "fabric";
// import ContextMenu from "./ContextMenu";

// const FabricCanvas = () => {
//   const canvasRef = useRef(null);
//   const wrapperRef = useRef(null);

//   const {
//     setCanvas,
//     saveState,
//     setActiveObject,
//     canvas: fabricCanvas,
//     pages,
//     activePageIndex,
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

//   // Fit the canvas to wrapper while keeping aspect ratio
//   const updateCanvasView = useCallback(() => {
//     if (!fabricCanvas || !wrapperRef.current) return;
//     if (!fabricCanvas.contextContainer) return; // 🔹 Guard

//     const page = pages[activePageIndex];
//     if (!page) return;

//     const canvasWidth = fabricCanvas.getWidth();
//     const canvasHeight = fabricCanvas.getHeight();
//     const containerWidth = wrapperRef.current.clientWidth;
//     const containerHeight = wrapperRef.current.clientHeight;

//     const scale = Math.min(
//       containerWidth / canvasWidth,
//       containerHeight / canvasHeight
//     );
//     fabricCanvas.setZoom(scale);

//     const panX = (containerWidth - canvasWidth * scale) / 2;
//     const panY = (containerHeight - canvasHeight * scale) / 2;
//     fabricCanvas.viewportTransform[4] = panX;
//     fabricCanvas.viewportTransform[5] = panY;

//     fabricCanvas.requestRenderAll();
//   }, [fabricCanvas, pages, activePageIndex]);

//   useEffect(() => {
//     updateCanvasViewRef.current = updateCanvasView;
//   });

//   useEffect(() => {
//     updateCanvasViewRef.current?.();
//   }, [historyTimestamp, updateCanvasView]);

//   useEffect(() => {
//     if (!canvasRef.current || !wrapperRef.current) return;
//     const page = pages[activePageIndex];
//     if (!page) return;

//     // -----------------------------
//     // 🔹 Initialize Fabric Canvas
//     // -----------------------------
//     const canvasInstance = new fabric.Canvas(canvasRef.current, {
//       width: page?.undoStack[0]?.width || 800,
//       height: page?.undoStack[0]?.height || 600,
//       preserveObjectStacking: true,
//       backgroundColor: "#ffffff",
//     });

//     setCanvas(canvasInstance);

//     // -----------------------------
//     // 🔹 Snapping & Guides
//     // -----------------------------
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

//     // 🔹 Snap to canvas edges, center, and objects
//     const handleObjectMove = (e) => {
//       const obj = e.target;
//       if (!obj) return;
//       clearGuides();
//       // ... your snapping logic here
//     };

//     canvasInstance.on("object:moving", handleObjectMove);
//     canvasInstance.on("object:modified", clearGuides);
//     canvasInstance.on("selection:cleared", clearGuides);

//     // -----------------------------
//     // 🔹 Drag & Drop Images
//     // -----------------------------
//     const handleDrop = (e) => {
//       e.preventDefault();
//       if (!canvasRef.current) return;

//       const file = e.dataTransfer?.files?.[0];
//       if (!file || !file.type.startsWith("image/")) return;

//       const pointer = canvasInstance.getPointer(e);

//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         fabric.Image.fromURL(ev.target.result, (img) => {
//           img.set({
//             left: pointer.x,
//             top: pointer.y,
//             originX: "center",
//             originY: "center",
//           });
//           img.scaleToWidth(200);
//           canvasInstance.add(img).setActiveObject(img);
//           if (canvasInstance.contextContainer) {
//             canvasInstance.requestRenderAll();
//           }
//           saveState?.();
//         });
//       };
//       reader.readAsDataURL(file);
//     };

//     // -----------------------------
//     // 🔹 Context Menu
//     // -----------------------------
//     const handleContextMenu = (e) => {
//       e.preventDefault();
//       const target = canvasInstance.findTarget(e, false);
//       setContextMenu({
//         visible: true,
//         x: e.clientX,
//         y: e.clientY,
//         target,
//       });
//     };

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

//     const container = wrapperRef.current;
//     container.addEventListener("contextmenu", handleContextMenu);
//     container.addEventListener("dragover", (e) => e.preventDefault());
//     container.addEventListener("drop", handleDrop);

//     // -----------------------------
//     // 🔹 Load initial JSON safely
//     // -----------------------------
//     const initialState = page?.undoStack[0];
//     if (initialState) {
//       canvasInstance.loadFromJSON(initialState, () => {
//         if (canvasInstance.contextContainer) {
//           canvasInstance.requestRenderAll();
//           updateCanvasViewRef.current?.();
//         }
//       });
//     }

//     // -----------------------------
//     // 🔹 Resize observer
//     // -----------------------------
//     const resizeObserver = new ResizeObserver(() => {
//       updateCanvasViewRef.current?.();
//     });
//     if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

//     return () => {
//       container.removeEventListener("contextmenu", handleContextMenu);
//       container.removeEventListener("drop", handleDrop);
//       if (wrapperRef.current) resizeObserver.unobserve(wrapperRef.current);
//       if (canvasInstance) canvasInstance.dispose();
//       setCanvas(null);
//     };
//   }, [pages, activePageIndex, saveState, setActiveObject, setCanvas]);

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
