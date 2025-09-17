import React, { useEffect } from "react";
import LeftToolbar from "./components/LeftToolbar";
import FabricCanvas from "./components/FabricCanvas";
import RightPropertiesPanel from "./components/RightPropertiesPanel";
import Header from "./components/Header";
import PrimaryToolbar from "./components/PrimaryToolbar";
import PageSlider from "./components/PageSlider";
import { useStore } from "./store"; // ✅ Import the store

function App() {
  // ✅ Get all the actions we need for the shortcuts
  const {
    undo,
    redo,
    duplicate,
    cut,
    paste,
    copy, // Make sure to get copy
    deleteSelection,
    isPresentationMode,
    togglePresentationMode,
  } = useStore();

  // ✅ Add a global keydown event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isPresentationMode) {
        togglePresentationMode();
        return;
      }
      // Don't trigger shortcuts if we're typing in an input
      const isTyping =
        e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
      if (isTyping) return;

      const isCtrl = e.ctrlKey || e.metaKey; // Handle Ctrl (Windows) and Cmd (Mac)

      if (isCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (isCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (isCtrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicate();
      } else if (isCtrl && e.key.toLowerCase() === "x") {
        e.preventDefault();
        cut();
      } else if (isCtrl && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copy();
      } else if (isCtrl && e.key.toLowerCase() === "v") {
        e.preventDefault();
        paste();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    undo,
    redo,
    duplicate,
    cut,
    paste,
    copy,
    deleteSelection,
    isPresentationMode, // ✅ Add dependencies
    togglePresentationMode,
  ]); // Add dependencies

  const containerClassName = isPresentationMode
    ? "app-container presentation-mode"
    : "app-container";

  return (
    <div className="app-container">
      <div className="left-column">
        <PrimaryToolbar />
        <LeftToolbar />
      </div>
      <main className="main-content">
        <Header />
        <div className="canvas-panel">
          <FabricCanvas />
        </div>
        <PageSlider />
      </main>
      <RightPropertiesPanel />
    </div>
  );
}

export default App;
