// import { create } from "zustand";
// import { fabric } from "fabric";

// // inside useStore
// const createNewPage = (pageNumber, width = 800, height = 600) => {
//   const blankCanvas = new fabric.Canvas(null, {
//     backgroundColor: "#ffffff",
//     width,
//     height,
//   });
//   const json = blankCanvas.toJSON();
//   blankCanvas.dispose();
//   return {
//     title: `Page ${pageNumber}`,
//     undoStack: [json],
//     redoStack: [],
//     width,
//     height,
//   };
// };

// const useStore = create((set, get) => ({
//   // Core State
//   canvas: null,
//   activeObject: null,
//   pages: [createNewPage(1)],
//   activePageIndex: 0,
//   historyTimestamp: Date.now(),
//   activeTool: "shapes",
//   clipboard: null,
//   isPresentationMode: false,
//   isEyedropperActive: false,
//   activeColor: "#000000",

//   images: [
//     "https://picsum.photos/id/10/300/200",
//     "https://picsum.photos/id/20/300/200",
//     "https://picsum.photos/id/30/300/200",
//     "https://picsum.photos/id/40/300/200",
//   ],

//   templates: [],
//   setTemplates: (templates) => set({ templates }),

//   // ✅ Fetch all templates from backend
//   fetchTemplates: async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/templates");
//       const data = await res.json();
//       set({ templates: data });
//     } catch (err) {
//       console.error("❌ Fetch templates failed:", err);
//     }
//   },

//   // ✅ Save current canvas as template
//   saveTemplate: async (name) => {
//     const canvas = get().canvas;
//     if (!canvas) return;

//     const json = canvas.toJSON();

//     await fetch("http://localhost:5000/api/templates/save", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, data: json }),
//     });

//     // refresh list
//     await get().fetchTemplates();
//   },

//   // ✅ Load a template by ID
//   loadTemplate: async (id) => {
//     const canvas = get().canvas;
//     if (!canvas) return;

//     const res = await fetch(`http://localhost:5000/api/templates/${id}`);
//     const template = await res.json();

//     if (template?.data) {
//       canvas.loadFromJSON(template.data, () => {
//         canvas.renderAll();
//       });
//     }
//   },

//   updateCanvasViewRef: null,
//   setUpdateCanvasViewRef: (ref) => set({ updateCanvasViewRef: ref }),

//   // ✅ ADD THESE TWO NEW STATES
//   isColorPickerActive: false, // Is the eyedropper tool on?
//   pickedColor: null, // Stores the color you picked
//   // ✅ ADD THIS NEW STATE
//   isSizeSelected: false,

//   // ✅ ADD THESE ACTIONS TO CHANGE THE STATES
//   setIsColorPickerActive: (isActive) => set({ isColorPickerActive: isActive }),
//   setPickedColor: (color) => set({ pickedColor: color }),

//   // ✅ ADD THESE TWO NEW ACTIONS
//   setIsEyedropperActive: (isActive) => set({ isEyedropperActive: isActive }),
//   setActiveColor: (color) => set({ activeColor: color }),

//   // Setters
//   setCanvas: (canvasInstance) => set({ canvas: canvasInstance }),
//   setActiveObject: (object) => set({ activeObject: object }),
//   setActiveTool: (tool) => set({ activeTool: tool }),

//   initializePageSize: (width, height) => {
//     const initialPage = createNewPage(1, width, height);
//     set({
//       pages: [initialPage],
//       activePageIndex: 0,
//       isSizeSelected: true,
//       historyTimestamp: Date.now(),
//     });
//   },
//   // This is for saving actions ON a page (like moving an object)
//   saveState: () => {
//     const { canvas, pages, activePageIndex } = get();
//     if (!canvas) return;
//     const json = canvas.toJSON();
//     const newPages = [...pages];
//     newPages[activePageIndex].undoStack.push(json);
//     newPages[activePageIndex].redoStack = [];
//     set({ pages: newPages, historyTimestamp: Date.now() });
//   },

//   // ✅ THIS IS THE STABLE, CORRECTED PAGE SWAPPING FUNCTION
//   setActivePage: (index) => {
//     const { canvas, pages, activePageIndex } = get();
//     if (index === activePageIndex || !canvas) {
//       return;
//     }

//     // Step 1: Save the current canvas state to the page we are leaving.
//     const currentStateJson = canvas.toJSON();
//     const updatedPages = pages.map((page, i) => {
//       if (i === activePageIndex) {
//         // Create a new object for the page we're leaving with the updated history
//         return {
//           ...page,
//           undoStack: [...page.undoStack, currentStateJson],
//           redoStack: [],
//         };
//       }
//       return page;
//     });

//     // Step 2: Get the state for the new page we are switching to.
//     const nextPageState =
//       updatedPages[index].undoStack[updatedPages[index].undoStack.length - 1];

//     // Step 3: Load the new state into the canvas.
//     canvas.loadFromJSON(nextPageState, () => {
//       canvas.renderAll();
//       // Step 4: Update the application state AFTER the canvas is loaded.
//       set({
//         pages: updatedPages,
//         activePageIndex: index,
//         activeObject: canvas.getActiveObject(),
//         historyTimestamp: Date.now(),
//       });
//     });
//   },

//   togglePresentationMode: () =>
//     set((state) => ({ isPresentationMode: !state.isPresentationMode })),

//   // Add function to update page size
//   updatePageSize: (width, height) => {
//     const { pages, activePageIndex, canvas, saveState, updateCanvasViewRef } =
//       get();
//     if (!canvas) return;

//     const newPages = [...pages];
//     newPages[activePageIndex].width = width;
//     newPages[activePageIndex].height = height;

//     canvas.setWidth(width);
//     canvas.setHeight(height);
//     canvas.renderAll();

//     if (updateCanvasViewRef?.current) {
//       updateCanvasViewRef.current();
//     }

//     saveState();
//     set({ pages: newPages, historyTimestamp: Date.now() });
//   },

//   // Undo/Redo functions
//   undo: () => {
//     const { canvas, pages, activePageIndex } = get();
//     if (!canvas) return;
//     const activePage = pages[activePageIndex];
//     if (activePage.undoStack.length <= 1) return;
//     const newPages = [...pages];
//     const popped = newPages[activePageIndex].undoStack.pop();
//     newPages[activePageIndex].redoStack.push(popped);
//     const prevState =
//       newPages[activePageIndex].undoStack[
//         newPages[activePageIndex].undoStack.length - 1
//       ];
//     canvas.loadFromJSON(prevState, () => {
//       canvas.renderAll();
//       set({
//         pages: newPages,
//         activeObject: canvas.getActiveObject(),
//         historyTimestamp: Date.now(),
//       });
//     });
//   },

//   redo: () => {
//     const { canvas, pages, activePageIndex } = get();
//     if (!canvas) return;
//     const activePage = pages[activePageIndex];
//     if (activePage.redoStack.length === 0) return;
//     const newPages = [...pages];
//     const stateToRestore = newPages[activePageIndex].redoStack.pop();
//     newPages[activePageIndex].undoStack.push(stateToRestore);
//     canvas.loadFromJSON(stateToRestore, () => {
//       canvas.renderAll();
//       set({
//         pages: newPages,
//         activeObject: canvas.getActiveObject(),
//         historyTimestamp: Date.now(),
//       });
//     });
//   },

//   // All other functions are included
//   addPage: () => {
//     const newPages = [...get().pages, createNewPage(get().pages.length + 1)];
//     const newIndex = newPages.length - 1;
//     set({ pages: newPages });
//     get().setActivePage(newIndex);
//   },

//   deletePage: (indexToDelete) => {
//     const { pages, activePageIndex, canvas } = get();
//     if (pages.length <= 1) return;
//     let newActiveIndex = activePageIndex;
//     if (newActiveIndex === indexToDelete)
//       newActiveIndex = Math.max(0, indexToDelete - 1);
//     else if (newActiveIndex > indexToDelete) newActiveIndex -= 1;
//     const newPages = pages.filter((_, i) => i !== indexToDelete);
//     const nextPageState =
//       newPages[newActiveIndex].undoStack[
//         newPages[newActiveIndex].undoStack.length - 1
//       ];
//     canvas.loadFromJSON(nextPageState, () => {
//       canvas.renderAll();
//       set({
//         pages: newPages,
//         activePageIndex: newActiveIndex,
//         activeObject: canvas.getActiveObject(),
//         historyTimestamp: Date.now(),
//       });
//     });
//   },

//   deleteSelection: () => {
//     const { canvas, saveState } = get();
//     if (!canvas) return;
//     canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
//     canvas.discardActiveObject().requestRenderAll();
//     saveState();
//   },

//   duplicate: () => {
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (!activeObject) return;
//     activeObject.clone((cloned) => {
//       cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
//       canvas.add(cloned).setActiveObject(cloned).requestRenderAll();
//       saveState();
//     });
//   },

//   copy: () => {
//     const { canvas } = get();
//     canvas?.getActiveObject()?.clone((cloned) => set({ clipboard: cloned }));
//   },

//   cut: () => {
//     get().copy();
//     get().deleteSelection();
//   },

//   paste: () => {
//     const { canvas, clipboard, saveState } = get();
//     if (!clipboard || !canvas) return;
//     clipboard.clone((cloned) => {
//       cloned.set({
//         left: cloned.left + 20,
//         top: cloned.top + 20,
//         evented: true,
//       });
//       canvas.add(cloned).setActiveObject(cloned).requestRenderAll();
//       saveState();
//     });
//   },

//   group: () => {
//     const { canvas, saveState } = get();
//     const activeSelection = canvas?.getActiveObject();
//     if (activeSelection?.type !== "activeSelection") return;
//     activeSelection.toGroup();
//     canvas.requestRenderAll();
//     saveState();
//   },

//   ungroup: () => {
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (activeObject?.type !== "group") return;
//     activeObject.toActiveSelection();
//     canvas.requestRenderAll();
//     saveState();
//   },

//   bringForward: () => {
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (activeObject) {
//       canvas.bringForward(activeObject);
//       saveState();
//     }
//   },

//   sendBackwards: () => {
//     const { canvas, saveState } = get();
//     const activeObject = canvas?.getActiveObject();
//     if (activeObject) {
//       canvas.sendBackwards(activeObject);
//       saveState();
//     }
//   },
// }));

// export { useStore };

// anurag8617/react_canvas_editor_sparkmap/React_Canvas_Editor_SparkMap-6b6c61e63d70753ed29e0c6da41bad1ecd6bbce2/src/store.js

// anurag8617/react_canvas_editor_sparkmap/React_Canvas_Editor_SparkMap-6b6c61e63d70753ed29e0c6da41bad1ecd6bbce2/src/store.js

import { create } from "zustand";
import { fabric } from "fabric";

// inside useStore
const createNewPage = (pageNumber, width = 800, height = 600) => {
  const blankCanvas = new fabric.Canvas(null, {
    backgroundColor: "#ffffff",
    width,
    height,
  });
  const json = blankCanvas.toJSON();
  blankCanvas.dispose();
  return {
    title: `Page ${pageNumber}`,
    undoStack: [json],
    redoStack: [],
    width,
    height,
  };
};

const useStore = create((set, get) => ({
  // Core State
  canvas: null,
  activeObject: null,
  pages: [createNewPage(1)],
  activePageIndex: 0,
  historyTimestamp: Date.now(),
  activeTool: "shapes",
  clipboard: null,
  isPresentationMode: false,
  isEyedropperActive: false,
  activeColor: "#000000",

  images: [
    "https://picsum.photos/id/10/300/200",
    "https://picsum.photos/id/20/300/200",
    "https://picsum.photos/id/30/300/200",
    "https://picsum.photos/id/40/300/200",
  ],

  templates: [],
  setTemplates: (templates) => set({ templates }),

  // ✅ Fetch all templates from backend
  fetchTemplates: async () => {
    try {
      const res = await fetch("http://localhost:5000/api/templates");
      const data = await res.json();
      set({ templates: data });
    } catch (err) {
      console.error("❌ Fetch templates failed:", err);
    }
  },

  // ✅ CORRECTLY SAVES ALL PAGES
  saveTemplate: async (name) => {
    const { pages, canvas, activePageIndex } = get();
    if (!pages || pages.length === 0 || !canvas) return;

    const currentStateJson = canvas.toJSON();
    const updatedPages = pages.map((page, i) => {
      if (i === activePageIndex) {
        return {
          ...page,
          undoStack: [...page.undoStack, currentStateJson],
          redoStack: [],
        };
      }
      return page;
    });

    await fetch("http://localhost:5000/api/templates/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, data: updatedPages }),
    });

    await get().fetchTemplates();
  },

  // ✅ CORRECTLY LOADS ALL PAGES (AND HANDLES OLD TEMPLATES)
  loadTemplate: async (id) => {
    const canvas = get().canvas;
    if (!canvas) return;

    try {
      const res = await fetch(`http://localhost:5000/api/templates/${id}`);
      if (!res.ok)
        throw new Error(`Failed to fetch template: ${res.statusText}`);
      const template = await res.json();

      if (template?.data) {
        let parsedData =
          typeof template.data === "string"
            ? JSON.parse(template.data)
            : template.data;
        const pages = Array.isArray(parsedData) ? parsedData : [parsedData];

        if (pages.length > 0 && pages[0]?.undoStack) {
          set({ pages, activePageIndex: 0, historyTimestamp: Date.now() });
          const firstPageJson = pages[0].undoStack.slice(-1)[0];

          canvas.loadFromJSON(firstPageJson, () => {
            canvas.renderAll();
            const { updateCanvasViewRef } = get();
            if (updateCanvasViewRef?.current) updateCanvasViewRef.current();
          });
        } else {
          alert("Error: Template data is invalid.");
        }
      }
    } catch (err) {
      console.error("❌ Failed to load template:", err);
      alert(`An error occurred while loading the template: ${err.message}`);
    }
  },

  // ✅ NEW DELETE FUNCTION
  deleteTemplate: async (id) => {
    try {
      await fetch(`http://localhost:5000/api/templates/${id}`, {
        method: "DELETE",
      });
      get().fetchTemplates();
    } catch (err) {
      console.error("❌ Failed to delete template:", err);
    }
  },  

  // ✅ ADD THESE TWO NEW STATES
  isColorPickerActive: false, // Is the eyedropper tool on?
  pickedColor: null, // Stores the color you picked
  // ✅ ADD THIS NEW STATE
  isSizeSelected: false,

  // ✅ ADD THESE ACTIONS TO CHANGE THE STATES
  setIsColorPickerActive: (isActive) => set({ isColorPickerActive: isActive }),
  setPickedColor: (color) => set({ pickedColor: color }),

  // ✅ ADD THESE TWO NEW ACTIONS
  setIsEyedropperActive: (isActive) => set({ isEyedropperActive: isActive }),
  setActiveColor: (color) => set({ activeColor: color }),

  // Setters
  setCanvas: (canvasInstance) => set({ canvas: canvasInstance }),
  setActiveObject: (object) => set({ activeObject: object }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  initializePageSize: (width, height) => {
    const initialPage = createNewPage(1, width, height);
    set({
      pages: [initialPage],
      activePageIndex: 0,
      isSizeSelected: true,
      historyTimestamp: Date.now(),
    });
  },
  // This is for saving actions ON a page (like moving an object)
  saveState: () => {
    const { canvas, pages, activePageIndex } = get();
    if (!canvas) return;
    const json = canvas.toJSON();
    const newPages = [...pages];
    newPages[activePageIndex].undoStack.push(json);
    newPages[activePageIndex].redoStack = [];
    set({ pages: newPages, historyTimestamp: Date.now() });
  },

  // ✅ THIS IS THE STABLE, CORRECTED PAGE SWAPPING FUNCTION
  setActivePage: (index) => {
    const { canvas, pages, activePageIndex } = get();
    if (index === activePageIndex || !canvas) {
      return;
    }

    // Step 1: Save the current canvas state to the page we are leaving.
    const currentStateJson = canvas.toJSON();
    const updatedPages = pages.map((page, i) => {
      if (i === activePageIndex) {
        // Create a new object for the page we're leaving with the updated history
        return {
          ...page,
          undoStack: [...page.undoStack, currentStateJson],
          redoStack: [],
        };
      }
      return page;
    });

    // Step 2: Get the state for the new page we are switching to.
    const nextPageState =
      updatedPages[index].undoStack[updatedPages[index].undoStack.length - 1];

    // Step 3: Load the new state into the canvas.
    canvas.loadFromJSON(nextPageState, () => {
      canvas.renderAll();
      // Step 4: Update the application state AFTER the canvas is loaded.
      set({
        pages: updatedPages,
        activePageIndex: index,
        activeObject: canvas.getActiveObject(),
        historyTimestamp: Date.now(),
      });
    });
  },

  togglePresentationMode: () =>
    set((state) => ({ isPresentationMode: !state.isPresentationMode })),

  // Add function to update page size
  updatePageSize: (width, height) => {
    const { pages, activePageIndex, canvas, saveState, updateCanvasViewRef } =
      get();
    if (!canvas) return;

    const newPages = [...pages];
    newPages[activePageIndex].width = width;
    newPages[activePageIndex].height = height;

    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();

    if (updateCanvasViewRef?.current) {
      updateCanvasViewRef.current();
    }

    saveState();
    set({ pages: newPages, historyTimestamp: Date.now() });
  },

  // Undo/Redo functions
  undo: () => {
    const { canvas, pages, activePageIndex } = get();
    if (!canvas) return;
    const activePage = pages[activePageIndex];
    if (activePage.undoStack.length <= 1) return;
    const newPages = [...pages];
    const popped = newPages[activePageIndex].undoStack.pop();
    newPages[activePageIndex].redoStack.push(popped);
    const prevState =
      newPages[activePageIndex].undoStack[
        newPages[activePageIndex].undoStack.length - 1
      ];
    canvas.loadFromJSON(prevState, () => {
      canvas.renderAll();
      set({
        pages: newPages,
        activeObject: canvas.getActiveObject(),
        historyTimestamp: Date.now(),
      });
    });
  },

  redo: () => {
    const { canvas, pages, activePageIndex } = get();
    if (!canvas) return;
    const activePage = pages[activePageIndex];
    if (activePage.redoStack.length === 0) return;
    const newPages = [...pages];
    const stateToRestore = newPages[activePageIndex].redoStack.pop();
    newPages[activePageIndex].undoStack.push(stateToRestore);
    canvas.loadFromJSON(stateToRestore, () => {
      canvas.renderAll();
      set({
        pages: newPages,
        activeObject: canvas.getActiveObject(),
        historyTimestamp: Date.now(),
      });
    });
  },

  // All other functions are included
  addPage: () => {
    const newPages = [...get().pages, createNewPage(get().pages.length + 1)];
    const newIndex = newPages.length - 1;
    set({ pages: newPages });
    get().setActivePage(newIndex);
  },

  deletePage: (indexToDelete) => {
    const { pages, activePageIndex, canvas } = get();
    if (pages.length <= 1) return;
    let newActiveIndex = activePageIndex;
    if (newActiveIndex === indexToDelete)
      newActiveIndex = Math.max(0, indexToDelete - 1);
    else if (newActiveIndex > indexToDelete) newActiveIndex -= 1;
    const newPages = pages.filter((_, i) => i !== indexToDelete);
    const nextPageState =
      newPages[newActiveIndex].undoStack[
        newPages[newActiveIndex].undoStack.length - 1
      ];
    canvas.loadFromJSON(nextPageState, () => {
      canvas.renderAll();
      set({
        pages: newPages,
        activePageIndex: newActiveIndex,
        activeObject: canvas.getActiveObject(),
        historyTimestamp: Date.now(),
      });
    });
  },

  deleteSelection: () => {
    const { canvas, saveState } = get();
    if (!canvas) return;
    canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject().requestRenderAll();
    saveState();
  },

  duplicate: () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) return;
    activeObject.clone((cloned) => {
      cloned.set({ left: cloned.left + 20, top: cloned.top + 20 });
      canvas.add(cloned).setActiveObject(cloned).requestRenderAll();
      saveState();
    });
  },

  copy: () => {
    const { canvas } = get();
    canvas?.getActiveObject()?.clone((cloned) => set({ clipboard: cloned }));
  },

  cut: () => {
    get().copy();
    get().deleteSelection();
  },

  paste: () => {
    const { canvas, clipboard, saveState } = get();
    if (!clipboard || !canvas) return;
    clipboard.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        evented: true,
      });
      canvas.add(cloned).setActiveObject(cloned).requestRenderAll();
      saveState();
    });
  },

  group: () => {
    const { canvas, saveState } = get();
    const activeSelection = canvas?.getActiveObject();
    if (activeSelection?.type !== "activeSelection") return;
    activeSelection.toGroup();
    canvas.requestRenderAll();
    saveState();
  },

  ungroup: () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();
    if (activeObject?.type !== "group") return;
    activeObject.toActiveSelection();
    canvas.requestRenderAll();
    saveState();
  },

  bringForward: () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      canvas.bringForward(activeObject);
      saveState();
    }
  },

  sendBackwards: () => {
    const { canvas, saveState } = get();
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      canvas.sendBackwards(activeObject);
      saveState();
    }
  },
}));

export { useStore };
