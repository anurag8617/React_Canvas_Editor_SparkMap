import React, { useEffect, useRef } from "react";
import { useStore } from "../store";
import * as fabric from "fabric";

const FabricCanvas = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const {
    canvas,
    setCanvas,
    saveState,
    setActiveObject,
    historyTimestamp,
    activePageIndex,
    pages,
  } = useStore();

  // -------------------
  // Canvas init (only once)
  // -------------------
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const width = wrapper?.clientWidth || 800;
    const height = wrapper?.clientHeight || 600;

    // Single canvas only
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      // backgroundColor: "#fff",
      preserveObjectStacking: true,
      selection: true,
      perPixelTargetFind: true, // accurate selection without upper canvas
      skipOffscreen: true, // use single canvas
    });

    // load initial state
    const initialState = useStore.getState().pages?.[0]?.undoStack?.[0];
    if (initialState) {
      canvasInstance.loadFromJSON(initialState, () => {
        canvasInstance.loadFromJSON(
          initialState,
          canvasInstance.renderAll.bind(canvasInstance)
        );
      });
    }



    const updateActiveObject = () =>
      setActiveObject(canvasInstance.getActiveObject());

    canvasInstance.on({
      "selection:created": updateActiveObject,
      "selection:updated": updateActiveObject,
      "selection:cleared": updateActiveObject,
      "object:modified": saveState,
    });

    setCanvas(canvasInstance);

    return () => {
      canvasInstance.dispose();
      setCanvas(null);
    };
  }, []);

  // -------------------
  // Load page/history
  // -------------------
  useEffect(() => {
    if (!canvas) return;

    const dropZone = canvas.getElement(); // single canvas
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

  useEffect(() => {
    if (!canvas) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const activePage = pages?.[activePageIndex];
    if (!activePage?.size) return;

    const [newW, newH] = activePage.size.split("x").map(Number);

    if (newW && newH) {
      canvas.setWidth(newW);
      canvas.setHeight(newH);
      canvas.calcOffset();
      canvas.requestRenderAll();
      canvas.setBackgroundColor("#fff", () => canvas.renderAll());
    }
  }, [pages, activePageIndex, canvas]);

  // -------------------
  // Drag & Drop
  // -------------------
  useEffect(() => {
    if (!canvas) return;
    const dropZone = canvas.upperCanvasEl;
    if (!dropZone) return;

    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
      e.preventDefault();
      if (!canvas) return;

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
        position: "relative", // ensure child canvas absolute positioning works
        background:
          "repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 50% / 20px 20px",
        overflow: "hidden", // prevent overflow
      }}
    >
      <div
        className="canvas-container"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#1e1e1e",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative", // important for Fabric upperCanvasEl positioning
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid black",
          }}
        />
      </div>
    </div>
  );
};

export default FabricCanvas;
