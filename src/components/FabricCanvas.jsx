import React, { useEffect, useRef, useState, useCallback } from "react";
import { useStore } from "../store"; // Assuming your Zustand store is in ../store
import { fabric } from "fabric";
import ContextMenu from "./ContextMenu"; // Assuming you have a ContextMenu component

const STORAGE_KEY = "fabricCanvasState";

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
    pages,
    activePageIndex,
  } = useStore();

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: null,
  });

  const updateCanvasViewRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Debounced function to save state to localStorage
  const debouncedSaveToLocalStorage = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const pagesToSave = useStore.getState().pages;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pagesToSave));
        console.log("Canvas state saved to localStorage.");
      } catch (error) {
        if (error.name === "QuotaExceededError") {
          console.error(
            "Error saving to localStorage: Storage quota exceeded. The canvas state is too large."
          );
        } else {
          console.error("Failed to save state to localStorage:", error);
        }
      }
    }, 1000); // Save 1 second after the last change
  }, []);

  // A single handler for all canvas state changes
  const handleCanvasChange = useCallback(() => {
    saveState(); // Update the in-memory state immediately for undo/redo
    debouncedSaveToLocalStorage(); // Schedule a debounced save to localStorage
  }, [saveState, debouncedSaveToLocalStorage]);

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
    if (updateCanvasViewRef.current) {
      updateCanvasViewRef.current();
    }
  }, [historyTimestamp]);

  useEffect(() => {
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: wrapperRef.current?.clientWidth,
      height: wrapperRef.current?.clientHeight,
      preserveObjectStacking: true,
      backgroundColor: "#ffffff",
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
        // Exclude guide lines from being saved in the JSON state
        excludeFromExport: true,
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

      // Canvas snapping (edges, center, margins)
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

      // Object-to-object snapping
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

    canvasInstance.on("object:modified", clearGuides);
    canvasInstance.on("selection:cleared", clearGuides);

    // --- Drag and Drop Logic ---
    const handleDrop = (e) => {
      e.preventDefault();
      if (!canvasInstance) return;
      const file = e.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        fabric.Image.fromURL(dataUrl, (fImg) => {
          const pointer = canvasInstance.getPointer(e);
          fImg.set({
            left: pointer.x,
            top: pointer.y,
            originX: "center",
            originY: "center",
          });
          fImg.scaleToWidth(200);
          canvasInstance.add(fImg).setActiveObject(fImg);
          canvasInstance.requestRenderAll();
          // No explicit save call needed; 'object:added' will handle it.
        });
      };
      reader.readAsDataURL(file);
    };

    // --- Standard Event Listeners ---
    const updateActiveObject = () =>
      setActiveObject(canvasInstance.getActiveObject());

    canvasInstance.on({
      "selection:created": updateActiveObject,
      "selection:updated": updateActiveObject,
      "selection:cleared": updateActiveObject,
      "object:added": handleCanvasChange,
      "object:removed": handleCanvasChange,
      "object:modified": handleCanvasChange,
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

    // --- Load saved state from localStorage on refresh ---
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedPages = JSON.parse(saved);
        if (Array.isArray(savedPages) && savedPages.length > 0) {
          useStore.setState({ pages: savedPages, activePageIndex: 0 });
          const firstPage = savedPages[0].undoStack.slice(-1)[0];
          canvasInstance.loadFromJSON(firstPage, () => {
            canvasInstance.renderAll();
            if (updateCanvasViewRef.current) {
              updateCanvasViewRef.current();
            }
          });
        }
      } catch (error) {
        console.error("Failed to parse pages from localStorage", error);
      }
    }

    setCanvas(canvasInstance);

    // --- Resize Observer ---
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

    // --- Cleanup Function ---
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
  }, [saveState, setActiveObject, setCanvas, handleCanvasChange]);

  // --- Color Picker useEffect ---
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
        handleCanvasChange();
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
    handleCanvasChange,
  ]);

  const currentPage = pages[activePageIndex];

  return (
    <div
      ref={wrapperRef}
      style={{
        width: `${currentPage.width}px`,
        height: `${currentPage.height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transpe",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          background: "#ffffff",
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
