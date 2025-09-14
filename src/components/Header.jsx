import React from "react";
import { useStore } from "../store";
import { jsPDF } from "jspdf";
import * as fabric from "fabric";

const Header = () => {
  const { canvas, saveState, pages, activePageIndex } = useStore();

  const loadCanvasFromState = (state) => {
    return new Promise((resolve) => {
      canvas.loadFromJSON(state, () => {
        canvas.renderAll();
        resolve();
      });
    });
  };

  const fitCanvasToPanel = (
    panelWidth,
    panelHeight,
    canvasWidth,
    canvasHeight
  ) => {
    const scale = Math.min(
      panelWidth / canvasWidth,
      panelHeight / canvasHeight,
      1
    );
    return {
      width: Math.floor(canvasWidth * scale),
      height: Math.floor(canvasHeight * scale),
      scale,
    };
  };

  const handleCanvasSizeChange = async (e) => {
    if (!canvas) return;

    const wrapper = document.querySelector(".canvas-container"); // Make sure your wrapper has this class
    if (!wrapper) return;

    const [requestedWidth, requestedHeight] = e.target.value
      .split("x")
      .map(Number);
    if (!requestedWidth || !requestedHeight) return;

    const panelWidth = wrapper.clientWidth;
    const panelHeight = wrapper.clientHeight;

    const { width, height, scale } = fitCanvasToPanel(
      panelWidth,
      panelHeight,
      requestedWidth,
      requestedHeight
    );

    // Save current objects
    const objectsData = canvas.getObjects().map((obj) => obj.toJSON());

    // Resize canvas
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.clear();
    canvas.backgroundColor = "#ffffff";

    // Re-add objects scaled proportionally (await async)
    await new Promise((resolve) => {
      fabric.util.enlivenObjects(objectsData, (objs) => {
        objs.forEach((obj) => {
          obj.scaleX *= scale;
          obj.scaleY *= scale;
          obj.left *= scale;
          obj.top *= scale;
          canvas.add(obj);
        });
        resolve();
      });
    });

    canvas.calcOffset();
    canvas.requestRenderAll();
    saveState(); // Save resized canvas in history
  };

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

  const exportPNG = async () => {
    if (!canvas) {
      console.warn("No canvas instance.");
      return;
    }

    // Detect whether this is a Fabric canvas
    const isFabricCanvas = !!canvas.getObjects && !!canvas.lowerCanvasEl;
    let originalBg = null;

    try {
      if (isFabricCanvas) {
        // Save & remove background for transparent export
        originalBg = canvas.backgroundColor ?? null;
        canvas.backgroundColor = null;
        (canvas.requestRenderAll || canvas.renderAll).call(canvas);

        // wait one frame to ensure the canvas was re-rendered
        await new Promise((r) => requestAnimationFrame(r));

        const htmlCanvas = canvas.lowerCanvasEl;
        if (!htmlCanvas)
          throw new Error("Unable to access underlying <canvas> element.");

        // Use toBlob if available (recommended)
        if (typeof htmlCanvas.toBlob === "function") {
          const blob = await new Promise((resolve, reject) => {
            htmlCanvas.toBlob(
              (b) =>
                b ? resolve(b) : reject(new Error("toBlob returned null")),
              "image/png",
              1
            );
          });

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "logo-design.png";
          document.body.appendChild(a); // ensure anchor is in DOM for some browsers
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // fallback toDataURL
          const dataURL = htmlCanvas.toDataURL("image/png");
          if (!dataURL) throw new Error("toDataURL returned empty value.");
          const a = document.createElement("a");
          a.href = dataURL;
          a.download = "logo-design.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        // restore background and re-render
        canvas.backgroundColor = originalBg;
        (canvas.requestRenderAll || canvas.renderAll).call(canvas);
      } else {
        // If `canvas` is a plain HTMLCanvasElement
        const htmlCanvas = canvas;
        if (typeof htmlCanvas.toBlob === "function") {
          const blob = await new Promise((resolve, reject) => {
            htmlCanvas.toBlob(
              (b) =>
                b ? resolve(b) : reject(new Error("toBlob returned null")),
              "image/png"
            );
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "logo-design.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const dataURL = htmlCanvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = dataURL;
          a.download = "logo-design.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      // best-effort restore
      try {
        if (isFabricCanvas) {
          canvas.backgroundColor = originalBg;
          (canvas.requestRenderAll || canvas.renderAll).call(canvas);
        }
      } catch (e) {}

      console.error("PNG export failed:", err);

      // Common CORS / taint detection
      const msg = String(err?.message || err).toLowerCase();
      if (
        msg.includes("taint") ||
        msg.includes("security") ||
        msg.includes("cross-origin")
      ) {
        alert(
          "PNG export failed: canvas is tainted by cross-origin image(s). " +
            "Load images with crossOrigin:'anonymous' and ensure the image server sends Access-Control-Allow-Origin. See console for details."
        );
      } else {
        alert("PNG export failed — check console for details.");
      }
    }
  };

  const exportSVG = () => {
    if (!canvas) return;
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logo-design.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        padding: "0.5rem 1rem",
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 6px 18px rgba(16, 24, 40, 0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={clearCanvas}
          className="btn-secondary"
          style={{ backgroundColor: "#f59e0b", color: "white" }}
        >
          Clear
        </button>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <div>
          <select onChange={handleCanvasSizeChange} defaultValue="800x600">
            <option value="800x600">800 × 600</option>
            <option value="1200x800">1200 × 800</option>
            <option value="1024x1024">1024 × 1024</option>
            <option value="600x800">600 × 800</option>
          </select>
        </div>
        <button onClick={exportPNG} className="btn-primary">
          Export PNG
        </button>
        <button
          onClick={exportSVG}
          className="btn-secondary"
          style={{ backgroundColor: "#334155", color: "white" }}
        >
          Export SVG
        </button>
        <button
          onClick={() => exportCurrentPageAsPDF()}
          className="btn-secondary"
        >
          Export Page PDF
        </button>
        <button onClick={() => exportAllPagesAsPDF()} className="btn-primary">
          Export All as PDF
        </button>
      </div>
    </header>
  );
};

export default Header;
