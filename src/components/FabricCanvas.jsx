// import React, { useEffect, useRef, useState } from "react";
// import { useStore } from "../store";
// import { fabric } from "fabric";
// import ContextMenu from "./ContextMenu";

// const FabricCanvas = () => {
//   const canvasRef = useRef(null);
//   const wrapperRef = useRef(null);
//   const { setCanvas, saveState, setActiveObject, pages } = useStore();
//   const [contextMenu, setContextMenu] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     target: null,
//   });

//   useEffect(() => {
//     const canvasInstance = new fabric.Canvas(canvasRef.current, {
//       width: wrapperRef.current?.clientWidth,
//       height: wrapperRef.current?.clientHeight,
//       preserveObjectStacking: true,
//     });

//     const updateActiveObject = () =>
//       setActiveObject(canvasInstance.getActiveObject());

//     const handleContextMenu = (opt) => {
//       opt.e.preventDefault();
//       setContextMenu({
//         visible: true,
//         x: opt.e.clientX,
//         y: opt.e.clientY,
//         target: opt.target,
//       });
//     };

//     canvasInstance.on({
//       "selection:created": updateActiveObject,
//       "selection:updated": updateActiveObject,
//       "selection:cleared": updateActiveObject,
//       "object:added": saveState,
//       "object:removed": saveState,
//       "mouse:up": saveState,
//       contextmenu: handleContextMenu,
//       // ✅ FIX: The conflicting "mouse:down" handler has been removed from here.
//     });

//     const initialState = pages[0].undoStack[0];
//     canvasInstance.loadFromJSON(initialState, () => canvasInstance.renderAll());
//     setCanvas(canvasInstance);

//     const resizeObserver = new ResizeObserver((entries) => {
//       const { width, height } = entries[0].contentRect;
//       canvasInstance.setWidth(width);
//       canvasInstance.setHeight(height);
//       canvasInstance.renderAll();
//     });
//     resizeObserver.observe(wrapperRef.current);

//     return () => {
//       resizeObserver.disconnect();
//       canvasInstance.dispose();
//       setCanvas(null);
//     };
//   }, []);

//   return (
//     <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
//       <canvas ref={canvasRef} />
//       {contextMenu.visible && (
//         <ContextMenu
//           x={contextMenu.x}
//           y={contextMenu.y}
//           target={contextMenu.target}
//           onClose={() => setContextMenu({ visible: false })}
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
  const { setCanvas, saveState, setActiveObject } = useStore();
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: null,
  });

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: wrapperRef.current?.clientWidth,
      height: wrapperRef.current?.clientHeight,
      preserveObjectStacking: true,
    });

    const updateActiveObject = () =>
      setActiveObject(canvasInstance.getActiveObject());

    // This block of listeners is for standard canvas interactions
    canvasInstance.on({
      "selection:created": updateActiveObject,
      "selection:updated": updateActiveObject,
      "selection:cleared": updateActiveObject,
      "object:added": saveState,
      "object:removed": saveState,
      "mouse:up": saveState,
    });

    // ✅ NEW: Direct browser event listener for right-click
    const handleContextMenu = (e) => {
      e.preventDefault(); // Stop the default browser menu
      const target = canvasInstance.findTarget(e, false); // Find if an object is clicked
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        target: target,
      });
    };

    // We add the listener to the canvas's parent container
    const canvasContainer = wrapperRef.current;
    canvasContainer.addEventListener("contextmenu", handleContextMenu);

    const initialState = useStore.getState().pages[0].undoStack[0];
    canvasInstance.loadFromJSON(initialState, () => canvasInstance.renderAll());
    setCanvas(canvasInstance);

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      canvasInstance.setWidth(width);
      canvasInstance.setHeight(height);
      canvasInstance.renderAll();
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    // Cleanup function
    return () => {
      // ✅ NEW: Remove the direct event listener on cleanup
      canvasContainer.removeEventListener("contextmenu", handleContextMenu);

      if (wrapperRef.current) {
        resizeObserver.unobserve(wrapperRef.current);
      }
      canvasInstance.dispose();
      setCanvas(null);
    };
  }, [saveState, setActiveObject, setCanvas]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} />
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
