import React, { useEffect, useRef, useState, useCallback } from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
import ContextMenu from "./ContextMenu";

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
    zoomLevel,
    setZoom,
  } = useStore();

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: null,
  });

  const updateCanvasViewRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // --- Debounced save ---
  const debouncedSaveToLocalStorage = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const pagesToSave = useStore.getState().pages;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pagesToSave));
        console.log("Canvas state saved to localStorage.");
      } catch (error) {
        if (error.name === "QuotaExceededError") {
          console.error("Storage quota exceeded.");
        } else {
          console.error("Failed to save state:", error);
        }
      }
    }, 1000);
  }, []);

  const handleCanvasChange = useCallback(() => {
    saveState();
    debouncedSaveToLocalStorage();
  }, [saveState, debouncedSaveToLocalStorage]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  // ✅ Wheel zoom handler (moved here, global)
  const handleWheel = useCallback(
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const currentZoom = useStore.getState().zoomLevel;
        let newZoom = currentZoom - delta * 0.005;
        newZoom = Math.max(0.1, Math.min(newZoom, 5)); // clamp zoom
        setZoom(newZoom);
      }
    },
    [setZoom]
  );

  // --- Update canvas view ---
  const updateCanvasView = useCallback(() => {
    if (!canvas || !wrapperRef.current) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const containerWidth = wrapperRef.current.clientWidth;
    const containerHeight = wrapperRef.current.clientHeight;

    // ✅ Keep your auto-fit logic
    const autoFitScale = Math.min(
      containerWidth / canvasWidth,
      containerHeight / canvasHeight,
      1
    );

    // ✅ Use zoomLevel if set, otherwise fallback to auto-fit
    const scale = zoomLevel || autoFitScale;

    canvas.setZoom(scale);

    const panX = (containerWidth - canvasWidth * scale) / 2;
    const panY = (containerHeight - canvasHeight * scale) / 2;
    canvas.viewportTransform[4] = panX;
    canvas.viewportTransform[5] = panY;
    canvas.renderAll();
  }, [canvas, zoomLevel]);

  useEffect(() => {
    updateCanvasViewRef.current = updateCanvasView;
  });

  useEffect(() => {
    if (updateCanvasViewRef.current) {
      updateCanvasViewRef.current();
    }
  }, [historyTimestamp, zoomLevel]);

  useEffect(() => {
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: wrapperRef.current?.clientWidth,
      height: wrapperRef.current?.clientHeight,
      preserveObjectStacking: true,
      backgroundColor: "#ffffff",
    });

    // --- Snapping logic ---
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

      // Snap to canvas edges
      if (Math.abs(objLeft) < snapThreshold) {
        obj.set({ left: 0 });
        addGuide(0, 0, 0, canvasH);
      }
      if (Math.abs(objTop) < snapThreshold) {
        obj.set({ top: 0 });
        addGuide(0, 0, canvasW, 0);
      }
      if (Math.abs(canvasW - objRight) < snapThreshold) {
        obj.set({ left: canvasW - obj.getScaledWidth() });
        addGuide(canvasW, 0, canvasW, canvasH);
      }
      if (Math.abs(canvasH - objBottom) < snapThreshold) {
        obj.set({ top: canvasH - obj.getScaledHeight() });
        addGuide(0, canvasH, canvasW, canvasH);
      }

      // Snap to canvas center
      if (Math.abs(canvasCenterX - objCenterX) < snapThreshold) {
        obj.set({ left: canvasCenterX - obj.getScaledWidth() / 2 });
        addGuide(canvasCenterX, 0, canvasCenterX, canvasH);
      }
      if (Math.abs(canvasCenterY - objCenterY) < snapThreshold) {
        obj.set({ top: canvasCenterY - obj.getScaledHeight() / 2 });
        addGuide(0, canvasCenterY, canvasW, canvasCenterY);
      }

      // Snap to nearby objects
      canvasInstance.forEachObject((target) => {
        if (target === obj) return;

        const tLeft = target.left;
        const tTop = target.top;
        const tRight = target.left + target.getScaledWidth();
        const tBottom = target.top + target.getScaledHeight();
        const tCenterX = target.left + target.getScaledWidth() / 2;
        const tCenterY = target.top + target.getScaledHeight() / 2;

        // Horizontal snapping
        if (Math.abs(objLeft - tLeft) < snapThreshold) {
          obj.set({ left: tLeft });
          addGuide(tLeft, 0, tLeft, canvasH);
        }
        if (Math.abs(objRight - tRight) < snapThreshold) {
          obj.set({ left: tRight - obj.getScaledWidth() });
          addGuide(tRight, 0, tRight, canvasH);
        }
        if (Math.abs(objCenterX - tCenterX) < snapThreshold) {
          obj.set({ left: tCenterX - obj.getScaledWidth() / 2 });
          addGuide(tCenterX, 0, tCenterX, canvasH);
        }

        // Vertical snapping
        if (Math.abs(objTop - tTop) < snapThreshold) {
          obj.set({ top: tTop });
          addGuide(0, tTop, canvasW, tTop);
        }
        if (Math.abs(objBottom - tBottom) < snapThreshold) {
          obj.set({ top: tBottom - obj.getScaledHeight() });
          addGuide(0, tBottom, canvasW, tBottom);
        }
        if (Math.abs(objCenterY - tCenterY) < snapThreshold) {
          obj.set({ top: tCenterY - obj.getScaledHeight() / 2 });
          addGuide(0, tCenterY, canvasW, tCenterY);
        }

        // Margin snapping (25px gap)
        if (Math.abs(objRight - tLeft - margin) < snapThreshold) {
          obj.set({ left: tLeft - obj.getScaledWidth() - margin });
          addGuide(tLeft - margin, 0, tLeft - margin, canvasH);
        }
        if (Math.abs(objLeft - tRight - margin) < snapThreshold) {
          obj.set({ left: tRight + margin });
          addGuide(tRight + margin, 0, tRight + margin, canvasH);
        }
        if (Math.abs(objBottom - tTop - margin) < snapThreshold) {
          obj.set({ top: tTop - obj.getScaledHeight() - margin });
          addGuide(0, tTop - margin, canvasW, tTop - margin);
        }
        if (Math.abs(objTop - tBottom - margin) < snapThreshold) {
          obj.set({ top: tBottom + margin });
          addGuide(0, tBottom + margin, canvasW, tBottom + margin);
        }
      });

      canvasInstance.renderAll();
    });

    canvasInstance.on("object:modified", clearGuides);
    canvasInstance.on("selection:cleared", clearGuides);

    // --- Drag & Drop ---
    const handleDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        fabric.Image.fromURL(ev.target.result, (fImg) => {
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
        });
      };
      reader.readAsDataURL(file);
    };

    // --- Context menu ---
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

    // --- Standard events ---
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

    // --- Attach listeners ---
    const canvasContainer = wrapperRef.current;
    const handleDragOver = (e) => e.preventDefault();
    canvasContainer.addEventListener("contextmenu", handleContextMenu);
    canvasContainer.addEventListener("dragover", handleDragOver);
    canvasContainer.addEventListener("drop", handleDrop);
    canvasContainer.addEventListener("wheel", handleWheel, { passive: false });

    // --- Load from localStorage ---
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

    // --- Resize observer ---
    const resizeObserver = new ResizeObserver(() => {
      if (updateCanvasViewRef.current) {
        updateCanvasViewRef.current();
      }
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    // --- Cleanup ---
    return () => {
      canvasContainer.removeEventListener("contextmenu", handleContextMenu);
      canvasContainer.removeEventListener("dragover", handleDragOver);
      canvasContainer.removeEventListener("drop", handleDrop);
      canvasContainer.removeEventListener("wheel", handleWheel);
      if (wrapperRef.current) resizeObserver.unobserve(wrapperRef.current);
      canvasInstance.dispose();
      setCanvas(null);
    };
  }, [saveState, setActiveObject, setCanvas, handleCanvasChange, handleWheel]);

  // --- Color Picker ---
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
        background: "transparent",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ background: "#ffffff", border: "2px solid black" }}
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
