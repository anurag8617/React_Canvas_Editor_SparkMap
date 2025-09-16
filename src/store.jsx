// // src/store/index.js
// import { create } from "zustand";
// import * as fabric from "fabric";

// // ✅ Helper to create a new blank page
// const createNewPage = (pageNumber) => {
//   const blankCanvas = new fabric.Canvas(null);
//   blankCanvas.backgroundColor = "#ffffff"; // ✅ FIX: Use toJSON() to capture all canvas properties including background
//   const json = blankCanvas.toJSON();
//   blankCanvas.dispose();
//   return {
//     title: `Page ${pageNumber}`,
//     undoStack: [json],
//     redoStack: [],
//   };
// };

// const useStore = create((set, get) => ({
//   // ---------------- Core state ----------------
//   canvas: null,
//   activeObject: null,
//   pages: [createNewPage(1)], // first page with title "Page 1"
//   activePageIndex: 0,
//   historyTimestamp: null,
//   activeTool: "shapes",

//   // ---------------- Gallery ----------------
//   imageGalleryUrls: [
//     "https://plus.unsplash.com/premium_photo-1736964054244-a73dfded4c71?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600",
//     "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=600",
//     "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=600",
//   ],

//   // ---------------- Setters ----------------
//   setCanvas: (canvasInstance) => set({ canvas: canvasInstance }),
//   setActiveObject: (object) => set({ activeObject: object }),
//   setActiveTool: (tool) => set({ activeTool: tool }),

//   // ---------------- History ----------------
//   saveState: () => {
//     const { canvas, pages, activePageIndex } = get();
//     if (!canvas) return;
//     try {
//       // ✅ FIX: Use toJSON() to save the entire canvas state, including background
//       const json = canvas.toJSON();
//       const newPages = [...pages];
//       newPages[activePageIndex].undoStack.push(json);
//       newPages[activePageIndex].redoStack = [];
//       set({ pages: newPages });
//     } catch (e) {
//       console.error("Could not save state:", e);
//     }
//   },

//   undo: () => {
//     const { pages, activePageIndex, canvas, set } = get();
//     const newPages = [...pages];
//     const activePage = newPages[activePageIndex];

//     if (activePage.undoStack.length <= 1) return;

//     const currentState = activePage.undoStack.pop();
//     activePage.redoStack.push(currentState);

//     const prevState = activePage.undoStack[activePage.undoStack.length - 1];

//     if (canvas && prevState) {
//       // ✅ The background is now included in the JSON, so this will work correctly.
//       canvas.loadFromJSON(prevState, () => {
//         canvas.renderAll();
//       });
//     }

//     set({ pages: newPages, historyTimestamp: Date.now() });
//   },

//   redo: () => {
//     const { pages, activePageIndex, canvas, set } = get();
//     const newPages = [...pages];
//     const activePage = newPages[activePageIndex];

//     if (activePage.redoStack.length === 0) return;

//     const stateToRestore = activePage.redoStack.pop();
//     activePage.undoStack.push(stateToRestore);

//     if (canvas && stateToRestore) {
//       // ✅ This will now restore the background color
//       canvas.loadFromJSON(stateToRestore, () => {
//         canvas.renderAll();
//       });
//     }

//     set({ pages: newPages, historyTimestamp: Date.now() });
//   },

//   // ---------------- Pages ----------------
//   addPage: () => {
//     set((state) => ({
//       pages: [...state.pages, createNewPage(state.pages.length + 1)],
//       activePageIndex: state.pages.length,
//       historyTimestamp: Date.now(),
//     }));
//   },

//   setActivePage: (index) => {
//     set({
//       activePageIndex: index,
//       historyTimestamp: Date.now(),
//     });
//   },

//   updatePageTitle: (index, newTitle) => {
//     set((state) => {
//       const newPages = [...state.pages];
//       if (newPages[index]) {
//         newPages[index].title = newTitle;
//       }
//       return { pages: newPages };
//     });
//   },

//   deletePage: (indexToDelete) => {
//     set((state) => {
//       if (state.pages.length <= 1) {
//         alert("You cannot delete the last page.");
//         return {};
//       }

//       const newPages = state.pages.filter((_, i) => i !== indexToDelete);
//       let newActiveIndex = state.activePageIndex;

//       if (newActiveIndex === indexToDelete) {
//         newActiveIndex = Math.max(0, indexToDelete - 1);
//       } else if (newActiveIndex > indexToDelete) {
//         newActiveIndex -= 1;
//       }

//       return {
//         pages: newPages,
//         activePageIndex: newActiveIndex,
//       };
//     });
//   },

//   updatePageSize: (index, newSize) => {
//     set((state) => {
//       const newPages = [...state.pages];
//       if (newPages[index]) {
//         newPages[index].size = newSize;
//       }
//       return { pages: newPages };
//     });
//   },
//   // ---------------- Object tools ----------------
//   duplicate: () => {
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (!activeObject) return;
//     activeObject.clone((cloned) => {
//       cloned.set({
//         left: activeObject.left + 20,
//         top: activeObject.top + 20,
//       });
//       canvas.add(cloned).setActiveObject(cloned);
//       canvas.requestRenderAll();
//       saveState();
//     });
//   },

//   group: () => {
//     const { canvas, saveState } = get();
//     const activeObjects = canvas?.getActiveObjects();
//     if (!activeObjects || activeObjects.length < 2) return;
//     const group = new fabric.Group(activeObjects, {
//       left: activeObjects[0].left,
//       top: activeObjects[0].top,
//     });
//     canvas.discardActiveObject();
//     activeObjects.forEach((obj) => canvas.remove(obj));
//     canvas.add(group).setActiveObject(group);
//     canvas.requestRenderAll();
//     saveState();
//   },

//   ungroup: () => {
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (activeObject && activeObject.type === "group") {
//       activeObject.toActiveSelection();
//       canvas.requestRenderAll();
//       saveState();
//     }
//   },
// }));

// export { useStore };

// src/store/index.js
import { create } from "zustand";
import * as fabric from "fabric";

// ✅ Helper to create a new blank page
const createNewPage = (pageNumber) => {
  const blankCanvas = new fabric.Canvas(null);
  blankCanvas.backgroundColor = "#ffffff";
  const json = blankCanvas.toJSON();
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
      const json = canvas.toJSON();
      const newPages = [...pages];
      newPages[activePageIndex].undoStack.push(json);
      newPages[activePageIndex].redoStack = [];
      set({ pages: newPages });
    } catch (e) {
      console.error("Could not save state:", e);
    }
  },

  setActivePage: (index) => {
    set((state) => {
      const activePageData =
        state.pages[index].undoStack[state.pages[index].undoStack.length - 1];
      if (state.canvas && activePageData) {
        state.canvas.loadFromJSON(activePageData, () => {
          state.canvas.renderAll();
        });
      }
      return {
        activePageIndex: index,
        historyTimestamp: Date.now(),
      };
    });
  },

  undo: () => {
    const { pages, activePageIndex, canvas } = get();
    const newPages = [...pages];
    const activePage = newPages[activePageIndex];

    if (activePage.undoStack.length <= 1) return;

    const currentState = activePage.undoStack.pop();
    activePage.redoStack.push(currentState);

    const prevState = activePage.undoStack[activePage.undoStack.length - 1];

    if (canvas && prevState) {
      canvas.loadFromJSON(prevState, () => {
        canvas.renderAll();
      });
    }

    set({ pages: newPages, historyTimestamp: Date.now() });
  },

  redo: () => {
    const { pages, activePageIndex, canvas } = get();
    const newPages = [...pages];
    const activePage = newPages[activePageIndex];

    if (activePage.redoStack.length === 0) return;

    const stateToRestore = activePage.redoStack.pop();
    activePage.undoStack.push(stateToRestore);

    if (canvas && stateToRestore) {
      canvas.loadFromJSON(stateToRestore, () => {
        canvas.renderAll();
      });
    }

    set({ pages: newPages, historyTimestamp: Date.now() });
  },

  addPage: () => {
    set((state) => ({
      pages: [...state.pages, createNewPage(state.pages.length + 1)],
      activePageIndex: state.pages.length,
      historyTimestamp: Date.now(),
    }));
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

  updatePageSize: (index, newSize) => {
    set((state) => {
      const newPages = [...state.pages];
      if (newPages[index]) {
        newPages[index].size = newSize;
      }
      return { pages: newPages };
    });
  },

  // ---------------- Object tools ----------------
  duplicate: async () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) {
      console.warn("No object selected to duplicate.");
      return;
    }

    try {
      // v6: clone() returns a Promise
      const cloned = await activeObject.clone();

      cloned.set({
        left: (activeObject.left || 0) + 20,
        top: (activeObject.top || 0) + 20,
      });

      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      saveState();
    } catch (e) {
      console.error("Failed to duplicate object:", e);
    }
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

    canvas.add(group);
    canvas.setActiveObject(group); // ✅ separate call
    canvas.requestRenderAll();
    saveState();
  },

  ungroup: () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();

    if (activeObject && activeObject.type === "group") {
      try {
        // Extract objects from the group
        const items = activeObject._objects || [];

        // Remove the group
        canvas.remove(activeObject);

        // Add each object back to canvas individually
        items.forEach((item) => {
          canvas.add(item);
          item.setCoords(); // update controls
        });

        // Optionally, select the first object
        if (items.length > 0) {
          canvas.setActiveObject(items[0]);
        }

        canvas.requestRenderAll();
        saveState();
      } catch (e) {
        console.error("Failed to ungroup:", e);
      }
    } else {
      console.warn("Please select a group to ungroup.");
    }
  },
}));

export { useStore };
  