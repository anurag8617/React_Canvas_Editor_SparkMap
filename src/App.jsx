import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useStore } from "./store";

// ✅ Pages

import InitialSizePage from "./pages/InitialSizePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  const {
    undo,
    redo,
    duplicate,
    cut,
    paste,
    copy,
    deleteSelection,
    isPresentationMode,
    togglePresentationMode,
    isSizeSelected,
    zoomLevel, // Get current zoom level
    setZoom, // Get the zoom action
  } = useStore();

  // ✅ Keep your keyboard shortcuts as-is
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isPresentationMode) {
        togglePresentationMode();
        return;
      }
      const isTyping =
        e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
      if (isTyping) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoom(zoomLevel + 0.1);
      } else if (isCtrl && e.key === "-") {
        e.preventDefault();
        setZoom(zoomLevel - 0.1);
      } else if (isCtrl && e.key.toLowerCase() === "z") {
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    duplicate,
    cut,
    paste,
    copy,
    deleteSelection,
    isPresentationMode,
    togglePresentationMode,
    zoomLevel, // Add dependencies
    setZoom,
  ]);

  return (
    <Router>
      <Routes>
        {/* First page → InitialSizeSelector */}
        <Route path="/" element={<InitialSizePage />} />

        {/* Second page → Canvas Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Redirect based on isSizeSelected */}
        <Route
          path="*"
          element={<Navigate to={isSizeSelected ? "/dashboard" : "/"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
  