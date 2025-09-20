import React from "react";
import { useStore } from "../store";
import { jsPDF } from "jspdf";
import { fabric } from "fabric";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

const Header = () => {
  const {
    canvas,
    saveState,
    pages,
    isPresentationMode,
    togglePresentationMode,
    updatePageSize,
  } = useStore();

  const clearCanvas = () => {
    if (
      canvas &&
      window.confirm("Are you sure you want to clear the canvas?")
    ) {
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
      saveState();
    }
  };

  const exportPNGTransparent = () => {
    if (!canvas) return;
    const originalBg = canvas.backgroundColor;
    canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1.0,
      enableRetinaScaling: true,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "design-transparent.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    canvas.setBackgroundColor(originalBg, canvas.renderAll.bind(canvas));
  };

  const exportPNG = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1.0 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJPG = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "jpeg", quality: 1.0 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "design.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSVG = () => {
    if (!canvas) return;
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "design.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrentPageAsPDF = () => {
    if (!canvas) return;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const orientation = canvasWidth > canvasHeight ? "l" : "p";

    const doc = new jsPDF({
      orientation,
      unit: "px",
      format: [canvasWidth, canvasHeight],
    });

    const dataURL = canvas.toDataURL({ format: "png", quality: 1.0 });
    doc.addImage(dataURL, "PNG", 0, 0, canvasWidth, canvasHeight);
    doc.save("current-page.pdf");
  };

  const exportAllPagesAsPDF = async () => {
    if (pages.length === 0) return;

    const firstPageJson = pages[0].undoStack[pages[0].undoStack.length - 1];
    let canvasWidth = firstPageJson.width || 800;
    let canvasHeight = firstPageJson.height || 600;
    const orientation = canvasWidth > canvasHeight ? "l" : "p";
    const doc = new jsPDF({
      orientation,
      unit: "px",
      format: [canvasWidth, canvasHeight],
    });

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage([canvasWidth, canvasHeight], orientation);

      const pageJson = pages[i].undoStack[pages[i].undoStack.length - 1];
      const tempCanvas = new fabric.StaticCanvas(null, {
        width: canvasWidth,
        height: canvasHeight,
      });

      await new Promise((resolve) =>
        tempCanvas.loadFromJSON(pageJson, resolve)
      );
      tempCanvas.renderAll();
      const dataURL = tempCanvas.toDataURL({ format: "png", quality: 1.0 });
      doc.addImage(dataURL, "PNG", 0, 0, canvasWidth, canvasHeight);
      tempCanvas.dispose();
    }

    doc.save("all-pages.pdf");
  };

  return (
    <div
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 1rem",
        background: "#2a2a2a",
        borderRadius: "0.5rem",
        marginBottom: "1rem",
        flexShrink: 0,
      }}
    >
      <div>
        <button
          onClick={togglePresentationMode}
          title="Full Page View"
          style={{ marginRight: "1rem" }}
        >
          {isPresentationMode ? (
            <MdFullscreenExit size={20} />
          ) : (
            <MdFullscreen size={20} />
          )}
        </button>

        <button
          onClick={clearCanvas}
          style={{ marginRight: "1rem" }}
          className="btn-primary"
        >
          Clear Canvas
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Page size buttons
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => updatePageSize(800, 600)}>Landscape</button>
          <button onClick={() => updatePageSize(600, 800)}>Portrait</button>
        </div>   */}

        {/* Download dropdown */}
        <div className="dropdown">
          <button className="btn-primary">Download</button>
          <div className="dropdown-content">
            <button onClick={exportPNGTransparent}>
              Export PNG (Transparent)
            </button>
            <button onClick={exportPNG}>Export PNG (With Background)</button>
            <button onClick={exportJPG}>Export JPG</button>
            <button onClick={exportSVG}>Export SVG</button>
            <button onClick={exportCurrentPageAsPDF}>Export Page PDF</button>
            <button onClick={exportAllPagesAsPDF}>Export All as PDF</button>
          </div>
        </div>
      </div>

      <style>{`
        .dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background: #333;
          min-width: 200px;
          border-radius: 0.5rem;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.4);
          z-index: 10;
        }
        .dropdown-content button {
          width: 100%;
          padding: 0.5rem 1rem;
          text-align: left;
          background: transparent;
          color: white;
          border: none;
          cursor: pointer;
        }
        .dropdown-content button:hover {
          background: #444;
        }
        .dropdown:hover .dropdown-content {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default Header;
