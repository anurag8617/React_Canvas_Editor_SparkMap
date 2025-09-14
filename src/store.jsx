// src/store/index.js
import { create } from "zustand";
import * as fabric from "fabric";

// ✅ Helper to create a new blank page
const createNewPage = (pageNumber) => {
  const blankCanvas = new fabric.Canvas(null);
  blankCanvas.backgroundColor = "#ffffff";
  const json = blankCanvas.toDatalessJSON(["selectable"]);
  blankCanvas.dispose();
  return {
    title: `Page ${pageNumber}`,
    undoStack: [json],
    redoStack: [],
  };
};

const useStore = create((set, get) => ({
  // ---------------- Core state ----------------
  canvas: null,
  activeObject: null,
  pages: [createNewPage(1)], // first page with title "Page 1"
  activePageIndex: 0,
  historyTimestamp: null,
  activeTool: "shapes",

  // ---------------- Gallery ----------------
  imageGalleryUrls: [
    "https://plus.unsplash.com/premium_photo-1736964054244-a73dfded4c71?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ---------------- Setters ----------------
  setCanvas: (canvasInstance) => set({ canvas: canvasInstance }),
  setActiveObject: (object) => set({ activeObject: object }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  // ---------------- History ----------------
  saveState: () => {
    const { canvas, pages, activePageIndex } = get();
    if (!canvas) return;
    try {
      const json = canvas.toDatalessJSON(["selectable"]);
      const newPages = [...pages];
      newPages[activePageIndex].undoStack.push(json);
      newPages[activePageIndex].redoStack = [];
      set({ pages: newPages });
    } catch (e) {
      console.error("Could not save state:", e);
    }
  },

  undo: () => {
    const { pages, activePageIndex } = get();
    const newPages = [...pages];
    const activePage = newPages[activePageIndex];

    if (activePage.undoStack.length <= 1) return;

    const currentState = activePage.undoStack.pop();
    activePage.redoStack.push(currentState);
    set({ pages: newPages, historyTimestamp: Date.now() });
  },

  redo: () => {
    const { pages, activePageIndex } = get();
    const newPages = [...pages];
    const activePage = newPages[activePageIndex];

    if (activePage.redoStack.length === 0) return;

    const stateToRestore = activePage.redoStack.pop();
    activePage.undoStack.push(stateToRestore);
    set({ pages: newPages, historyTimestamp: Date.now() });
  },

  // ---------------- Pages ----------------
  addPage: () => {
    set((state) => ({
      pages: [...state.pages, createNewPage(state.pages.length + 1)],
      activePageIndex: state.pages.length,
      historyTimestamp: Date.now(),
    }));
  },

  setActivePage: (index) => {
    set({
      activePageIndex: index,
      historyTimestamp: Date.now(),
    });
  },

  updatePageTitle: (index, newTitle) => {
    set((state) => {
      const newPages = [...state.pages];
      if (newPages[index]) {
        newPages[index].title = newTitle;
      }
      return { pages: newPages };
    });
  },

  deletePage: (indexToDelete) => {
    set((state) => {
      if (state.pages.length <= 1) {
        alert("You cannot delete the last page.");
        return {};
      }

      const newPages = state.pages.filter((_, i) => i !== indexToDelete);
      let newActiveIndex = state.activePageIndex;

      if (newActiveIndex === indexToDelete) {
        newActiveIndex = Math.max(0, indexToDelete - 1);
      } else if (newActiveIndex > indexToDelete) {
        newActiveIndex -= 1;
      }

      return {
        pages: newPages,
        activePageIndex: newActiveIndex,
      };
    });
  },

  // ---------------- Object tools ----------------
  duplicate: () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) return;
    activeObject.clone((cloned) => {
      cloned.set({
        left: activeObject.left + 20,
        top: activeObject.top + 20,
      });
      canvas.add(cloned).setActiveObject(cloned);
      canvas.requestRenderAll();
      saveState();
    });
  },

  group: () => {
    const { canvas, saveState } = get();
    const activeObjects = canvas?.getActiveObjects();
    if (!activeObjects || activeObjects.length < 2) return;
    const group = new fabric.Group(activeObjects, {
      left: activeObjects[0].left,
      top: activeObjects[0].top,
    });
    canvas.discardActiveObject();
    activeObjects.forEach((obj) => canvas.remove(obj));
    canvas.add(group).setActiveObject(group);
    canvas.requestRenderAll();
    saveState();
  },

  ungroup: () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "group") {
      activeObject.toActiveSelection();
      canvas.requestRenderAll();
      saveState();
    }
  },
}));

export { useStore };
