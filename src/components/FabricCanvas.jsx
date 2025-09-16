// import React, { useEffect, useRef } from "react";
// import { useStore } from "../store";
// import * as fabric from "fabric";

// const FabricCanvas = () => {
//   const canvasRef = useRef(null);
//   const wrapperRef = useRef(null);
//   const isLoadingRef = useRef(false);

//   const {
//     canvas,
//     setCanvas,
//     saveState,
//     setActiveObject,
//     historyTimestamp,
//     activePageIndex,
//     pages,
//   } = useStore();

//   // -------------------
//   // Canvas init (only once)
//   // -------------------
//   useEffect(() => {
//     const wrapper = wrapperRef.current;
//     const width = wrapper?.clientWidth || 800;
//     const height = wrapper?.clientHeight || 600;

//     // Single canvas only
//     const canvasInstance = new fabric.Canvas(canvasRef.current, {
//       width,
//       height,
//       // backgroundColor: "#fff",
//       preserveObjectStacking: true,
//       selection: true,
//       perPixelTargetFind: true, // accurate selection without upper canvas
//       skipOffscreen: true, // use single canvas
//     });

//     // load initial state
//     const initialState = useStore.getState().pages?.[0]?.undoStack?.[0];
//     if (initialState) {
//       canvasInstance.loadFromJSON(initialState, () => {
//         canvasInstance.loadFromJSON(
//           initialState,
//           canvasInstance.renderAll.bind(canvasInstance)
//         );
//       });
//     }

//     const updateActiveObject = () =>
//       setActiveObject(canvasInstance.getActiveObject());

//     canvasInstance.on({
//       "selection:created": updateActiveObject,
//       "selection:updated": updateActiveObject,
//       "selection:cleared": updateActiveObject,
//       "object:modified": saveState,
//     });

//     setCanvas(canvasInstance);

//     return () => {
//       canvasInstance.dispose();
//       setCanvas(null);
//     };
//   }, []);

//   // -------------------
//   // Load page/history
//   // -------------------
//   useEffect(() => {
//     if (!canvas) return;

//     const dropZone = canvas.getElement(); // single canvas
//     if (!dropZone) return;

//     const handleDragOver = (e) => e.preventDefault();
//     const handleDrop = (e) => {
//       e.preventDefault();
//       const pointer = canvas.getPointer(e);
//       let imageUrl;

//       if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//         imageUrl = URL.createObjectURL(e.dataTransfer.files[0]);
//       } else {
//         imageUrl =
//           e.dataTransfer.getData("text/plain") ||
//           e.dataTransfer.getData("text/uri-list");
//       }
//       if (!imageUrl) return;

//       fabric.Image.fromURL(
//         imageUrl,
//         (img) => {
//           img.set({
//             left: pointer.x,
//             top: pointer.y,
//             originX: "center",
//             originY: "center",
//           });
//           canvas.add(img);
//           canvas.setActiveObject(img);
//           canvas.requestRenderAll();
//           saveState();
//         },
//         { crossOrigin: "Anonymous" }
//       );
//     };

//     dropZone.addEventListener("dragover", handleDragOver);
//     dropZone.addEventListener("drop", handleDrop);

//     return () => {
//       dropZone.removeEventListener("dragover", handleDragOver);
//       dropZone.removeEventListener("drop", handleDrop);
//     };
//   }, [canvas, saveState]);

//   useEffect(() => {
//     if (!canvas) return;
//     const wrapper = wrapperRef.current;
//     if (!wrapper) return;

//     const activePage = pages?.[activePageIndex];
//     if (!activePage?.size) return;

//     const [newW, newH] = activePage.size.split("x").map(Number);

//     if (newW && newH) {
//       canvas.setWidth(newW);
//       canvas.setHeight(newH);
//       canvas.calcOffset();
//       canvas.requestRenderAll();
//       canvas.setBackgroundColor("#fff", () => canvas.renderAll());
//     }
//   }, [pages, activePageIndex, canvas]);

//   // -------------------
//   // Drag & Drop
//   // -------------------
//   useEffect(() => {
//     if (!canvas) return;
//     const dropZone = canvas.upperCanvasEl;
//     if (!dropZone) return;

//     const handleDragOver = (e) => e.preventDefault();
//     const handleDrop = (e) => {
//       e.preventDefault();
//       if (!canvas) return;

//       const pointer = canvas.getPointer(e);
//       let imageUrl;

//       if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//         imageUrl = URL.createObjectURL(e.dataTransfer.files[0]);
//       } else {
//         imageUrl =
//           e.dataTransfer.getData("text/plain") ||
//           e.dataTransfer.getData("text/uri-list");
//       }
//       if (!imageUrl) return;

//       fabric.Image.fromURL(
//         imageUrl,
//         (img) => {
//           img.set({
//             left: pointer.x,
//             top: pointer.y,
//             originX: "center",
//             originY: "center",
//           });
//           canvas.add(img);
//           canvas.setActiveObject(img);
//           canvas.requestRenderAll();
//           saveState();
//         },
//         { crossOrigin: "Anonymous" }
//       );
//     };

//     dropZone.addEventListener("dragover", handleDragOver);
//     dropZone.addEventListener("drop", handleDrop);

//     return () => {
//       dropZone.removeEventListener("dragover", handleDragOver);
//       dropZone.removeEventListener("drop", handleDrop);
//     };
//   }, [canvas, saveState]);

//   return (
//     <div
//       ref={wrapperRef}
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "relative", // ensure child canvas absolute positioning works
//         background:
//           "repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 50% / 20px 20px",
//         overflow: "hidden", // prevent overflow
//       }}
//     >
//       <div
//         className="canvas-container"
//         style={{
//           width: "100%",
//           height: "100%",
//           backgroundColor: "#1e1e1e",
//           boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           position: "relative", // important for Fabric upperCanvasEl positioning
//         }}
//       >
//         <canvas
//           ref={canvasRef}
//           style={{
//             border: "1px solid black",
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default FabricCanvas;

// import React, { useEffect, useRef, useState } from "react";
// import { useStore } from "../store";
// import * as fabric from "fabric";
// import ContextMenu from "./ContextMenu";

// const FabricCanvas = () => {
//   const canvasRef = useRef(null);
//   const wrapperRef = useRef(null);
//   const isLoadingRef = useRef(false);

//   const {
//     canvas,
//     setCanvas,
//     saveState,
//     setActiveObject,
//     historyTimestamp,
//     activePageIndex,
//     pages,
//   } = useStore();

//   // Context menu state
//   const [contextMenu, setContextMenu] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     target: null,
//   });

//   // -------------------
//   // Canvas Initialization
//   // -------------------
//   useEffect(() => {
//     const wrapper = wrapperRef.current;
//     const width = wrapper?.clientWidth || 800;
//     const height = wrapper?.clientHeight || 600;

//     const canvasInstance = new fabric.Canvas(canvasRef.current, {
//       width,
//       height,
//       preserveObjectStacking: true,
//       selection: true,
//       perPixelTargetFind: true,
//       skipOffscreen: true,
//     });

//     // Active object updates
//     const updateActiveObject = () =>
//       setActiveObject(canvasInstance.getActiveObject());

//     canvasInstance.on({
//       "selection:created": updateActiveObject,
//       "selection:updated": updateActiveObject,
//       "selection:cleared": updateActiveObject,
//       "object:modified": saveState,
//       "object:added": saveState,
//       "object:removed": saveState,
//     });

//     // Load initial state for page[0]
//     const initialState = useStore.getState().pages?.[0]?.undoStack?.[0];
//     if (initialState) {
//       canvasInstance.loadFromJSON(initialState, () => {
//         canvasInstance.setBackgroundColor("#ffffff", () => {
//           canvasInstance.renderAll();
//         });
//       });
//     }

//     setCanvas(canvasInstance);

//     return () => {
//       canvasInstance.dispose();
//       setCanvas(null);
//     };
//   }, []);

//   // -------------------
//   // Context Menu Logic
//   // -------------------
//   // Corrected Context Menu Logic
//   useEffect(() => {
//     if (!canvas) return;

//     // This handler will be called on right-click
//     const handleContextMenu = (opt) => {
//       // Prevent the browser's native context menu
//       opt.e.preventDefault();
//       const pointer = canvas.getPointer(opt.e);
//       const target = canvas.findTarget(opt.e, false);

//       setContextMenu({
//         visible: true,
//         x: opt.e.clientX,
//         y: opt.e.clientY,
//         target: target,
//       });
//     };

//     // Close the menu on any left-click or interaction
//     const handleMouseDown = () => {
//       if (contextMenu.visible) {
//         setContextMenu((prev) => ({ ...prev, visible: false }));
//       }
//     };

//     // Attach the event listeners
//     canvas.on("contextmenu", handleContextMenu);
//     canvas.on("mouse:down", handleMouseDown);

//     // Clean up event listeners on component unmount or dependency change
//     return () => {
//       canvas.off("contextmenu", handleContextMenu);
//       canvas.off("mouse:down", handleMouseDown);
//     };
//   }, [canvas, contextMenu.visible]);

//   // -------------------
//   // Load page/history & size change
//   // -------------------
//   useEffect(() => {
//     if (!canvas || isLoadingRef.current) return;

//     const activePage = pages?.[activePageIndex];
//     if (!activePage) return;

//     isLoadingRef.current = true;
//     const pageState = activePage.undoStack[activePage.undoStack.length - 1];

//     if (pageState) {
//       canvas.loadFromJSON(pageState, () => {
//         if (pageState.width && pageState.height) {
//           canvas.setWidth(pageState.width);
//           canvas.setHeight(pageState.height);
//         }
//         canvas.renderAll();
//         isLoadingRef.current = false;
//       });
//     }

//     // Resize canvas if page size is defined
//     if (activePage.size) {
//       const [newW, newH] = activePage.size.split("x").map(Number);
//       if (newW && newH) {
//         canvas.setWidth(newW);
//         canvas.setHeight(newH);
//         canvas.calcOffset();
//         canvas.setBackgroundColor("#fff", () => canvas.renderAll());
//       }
//     }
//   }, [pages, activePageIndex, canvas]);

//   // -------------------
//   // Add initial circle on first load
//   // -------------------
//   useEffect(() => {
//     if (canvas && canvas.getObjects().length === 0) {
//       const initialCircle = new fabric.Circle({
//         left: canvas.getWidth() / 2,
//         top: canvas.getHeight() / 2,
//         radius: 50,
//         fill: "#b53b74",
//         originX: "center",
//         originY: "center",
//       });
//       canvas.add(initialCircle);
//       canvas.requestRenderAll();
//       saveState();
//     }
//   }, [canvas]);

//   // -------------------
//   // Drag & Drop
//   // -------------------
//   useEffect(() => {
//     if (!canvas) return;
//     const dropZone = canvas.getElement();
//     if (!dropZone) return;

//     const handleDragOver = (e) => e.preventDefault();
//     const handleDrop = (e) => {
//       e.preventDefault();
//       const pointer = canvas.getPointer(e);
//       let imageUrl;

//       if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//         imageUrl = URL.createObjectURL(e.dataTransfer.files[0]);
//       } else {
//         imageUrl =
//           e.dataTransfer.getData("text/plain") ||
//           e.dataTransfer.getData("text/uri-list");
//       }
//       if (!imageUrl) return;

//       fabric.Image.fromURL(
//         imageUrl,
//         (img) => {
//           img.set({
//             left: pointer.x,
//             top: pointer.y,
//             originX: "center",
//             originY: "center",
//           });
//           canvas.add(img);
//           canvas.setActiveObject(img);
//           canvas.requestRenderAll();
//           saveState();
//         },
//         { crossOrigin: "Anonymous" }
//       );
//     };

//     dropZone.addEventListener("dragover", handleDragOver);
//     dropZone.addEventListener("drop", handleDrop);

//     return () => {
//       dropZone.removeEventListener("dragover", handleDragOver);
//       dropZone.removeEventListener("drop", handleDrop);
//     };
//   }, [canvas, saveState]);

//   return (
//     <div
//       ref={wrapperRef}
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       <div
//         className="canvas-container"
//         style={{
//           width: "100%",
//           height: "100%",
//           boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           position: "relative",
//         }}
//       >
//         <canvas
//           ref={canvasRef}
//           style={{
//             border: "1px solid black",
//           }}
//         />
//       </div>

//       {contextMenu.visible && (
//         <ContextMenu
//           x={contextMenu.x}
//           y={contextMenu.y}
//           target={contextMenu.target}
//           onClose={() =>
//             setContextMenu((prev) => ({ ...prev, visible: false }))
//           }
//         />
//       )}
//     </div>
//   );
// };

// export default FabricCanvas;

import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import * as fabric from "fabric";
import ContextMenu from "./ContextMenu";

const FabricCanvas = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const isLoadingRef = useRef(false);

  const {
    canvas,
    setCanvas,
    saveState,
    setActiveObject,
    historyTimestamp,
    activePageIndex,
    pages,
  } = useStore();

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: null,
  }); // Canvas Initialization (runs once on mount)

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const width = wrapper?.clientWidth || 800;
    const height = wrapper?.clientHeight || 600;

    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      preserveObjectStacking: true,
      selection: true,
      perPixelTargetFind: true,
      skipOffscreen: true,
    });

    const updateActiveObject = () =>
      setActiveObject(canvasInstance.getActiveObject());

    canvasInstance.on({
      "selection:created": updateActiveObject,
      "selection:updated": updateActiveObject,
      "selection:cleared": updateActiveObject,
      "object:modified": saveState,
      "object:added": saveState,
      "object:removed": saveState,
    });

    const initialState = pages?.[0]?.undoStack?.[0];
    if (initialState) {
      canvasInstance.loadFromJSON(initialState, () => {
        canvasInstance.setBackgroundColor("#ffffff", () => {
          canvasInstance.renderAll();
        });
      });
    }

    setCanvas(canvasInstance);

    return () => {
      canvasInstance.dispose();
      setCanvas(null);
    };
  }, []); // Context Menu Logic

  useEffect(() => {
    if (!canvas) return;

    const handleContextMenu = (opt) => {
      opt.e.preventDefault();
      const target = canvas.findTarget(opt.e, false);

      const menuWidth = 150; // Set menu width to handle overflow
      const menuHeight = 200; // Set menu height to handle overflow
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      let x = opt.e.clientX - wrapperRect.left;
      let y = opt.e.clientY - wrapperRect.top; // Check if the menu would go off-screen to the right or bottom

      if (x + menuWidth > wrapperRect.width) {
        x = wrapperRect.width - menuWidth;
      }
      if (y + menuHeight > wrapperRect.height) {
        y = wrapperRect.height - menuHeight;
      }

      setContextMenu({
        visible: true,
        x,
        y,
        target: target,
      });
    };

    const handleMouseDown = (opt) => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    canvas.on("contextmenu", handleContextMenu);
    canvas.on("mouse:down", handleMouseDown);

    return () => {
      canvas.off("contextmenu", handleContextMenu);
      canvas.off("mouse:down", handleMouseDown);
    };
  }, [canvas, contextMenu.visible]); // Load page & history on change

  useEffect(() => {
    if (!canvas || isLoadingRef.current) return;
    const activePage = pages?.[activePageIndex];
    if (!activePage) return;

    isLoadingRef.current = true;
    // ✨ FIXED: Get the state from the end of the undoStack
    const pageState = activePage.undoStack[activePage.undoStack.length - 1];

    if (pageState) {
      canvas.loadFromJSON(pageState, () => {
        canvas.renderAll();
        isLoadingRef.current = false;
      });
    }
  }, [pages, activePageIndex, canvas]);

  useEffect(() => {
    if (canvas && canvas.getObjects().length === 0) {
      const initialCircle = new fabric.Circle({
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        radius: 50,
        fill: "#b53b74",
        originX: "center",
        originY: "center",
      });
      canvas.add(initialCircle);
      canvas.requestRenderAll();
      saveState();
    }
  }, [canvas]); // Drag & Drop

  useEffect(() => {
    if (!canvas) return;
    const dropZone = canvas.getElement();
    if (!dropZone) return;

    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
      e.preventDefault();
      const pointer = canvas.getPointer(e);
      let imageUrl;

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        imageUrl = URL.createObjectURL(e.dataTransfer.files[0]);
      } else {
        imageUrl =
          e.dataTransfer.getData("text/plain") ||
          e.dataTransfer.getData("text/uri-list");
      }
      if (!imageUrl) return;

      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          img.set({
            left: pointer.x,
            top: pointer.y,
            originX: "center",
            originY: "center",
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          saveState();
        },
        { crossOrigin: "Anonymous" }
      );
    };

    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("drop", handleDrop);

    return () => {
      dropZone.removeEventListener("dragover", handleDragOver);
      dropZone.removeEventListener("drop", handleDrop);
    };
  }, [canvas, saveState]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="canvas-container"
        style={{
          width: "100%",
          height: "100%",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid black",
          }}
        />
      </div>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextMenu.target}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
    </div>
  );
};

export default FabricCanvas;
