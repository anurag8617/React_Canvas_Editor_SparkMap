import React, { useEffect } from "react";
import LeftToolbar from "./components/LeftToolbar";
import FabricCanvas from "./components/FabricCanvas";
import RightPropertiesPanel from "./components/RightPropertiesPanel";
import Header from "./components/Header";
import PrimaryToolbar from "./components/PrimaryToolbar";
import { useStore } from "./store";
import "./index.css";

function App() {
  // ✅ Correctly get canvas, undo, and redo from the store
  const { canvas, undo, redo } = useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if typing inside an input field
      const isTyping =
        e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
      if (isTyping) return;

      // Handle Delete/Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        if (canvas) {
          canvas.getActiveObjects().forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject().requestRenderAll();
        }
      }

      // Handle Undo/Redo
      const isCtrl = e.ctrlKey || e.metaKey; // metaKey for Mac
      if (isCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if (isCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, undo, redo]); // ✅ Add undo and redo to the dependency array

  return (
    <div className="app-container">
      <div className="left-column">
        <PrimaryToolbar />
        <LeftToolbar />
      </div>
      <main className="main-content">
        <Header />
        <div className="panel">
          <FabricCanvas />
        </div>
      </main>
      <RightPropertiesPanel />
    </div>
  );
}

export default App;
