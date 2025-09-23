import React, { useRef, useEffect, useState } from "react";
import { useStore } from "../store";
import { fabric } from "fabric";
import {
  MdCropSquare,
  MdRadioButtonUnchecked,
  MdChangeHistory,
  MdContentCopy,
  MdOutlineGroup,
  MdCloseFullscreen,
  MdArrowUpward,
  MdArrowDownward,
  MdBlurOn,
  MdRemove,
  MdPentagon,
  MdStarBorder,
} from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import IconLibrary from "./icons/IconLibrary";

const LeftToolbar = () => {
  const {
    canvas,
    saveState,
    activeTool,
    duplicate,
    group,
    ungroup,
    bringForward,
    sendBackwards,
    templates, // ✅ add this
    loadTemplate,
    deleteTemplate,
  } = useStore();

  const uploadInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [activeImageTab, setActiveImageTab] = useState("my");

  const [searchQuery, setSearchQuery] = useState("nature");
  const [unsplashImages, setUnsplashImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/images");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const data = await res.json();
        const imageUrls = data.map(
          (img) => `http://localhost:5000/uploads/${img.filename}`
        );
        setImages(imageUrls);
        if (imageUrls.length > 0) {
          addImageFromUrl(imageUrls[0]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch images:", err);
      }
    };
    loadImages();
  }, []);

  const addShape = (shapeType) => {
    if (!canvas) return;
    let shape;
    if (shapeType === "rect") {
      shape = new fabric.Rect({
        width: 100,
        height: 100,
        fill: "#FF6B6B",
        top: 50,
        left: 50,
      });
    } else if (shapeType === "circle") {
      shape = new fabric.Circle({
        radius: 50,
        fill: "#4D96FF",
        top: 100,
        left: 100,
      });
    } else if (shapeType === "triangle") {
      shape = new fabric.Triangle({
        width: 100,
        height: 100,
        fill: "#FFD56B",
        top: 50,
        left: 50,
      });
    } else if (shapeType === "ellipse") {
      shape = new fabric.Ellipse({
        rx: 75,
        ry: 40,
        fill: "#9370DB",
        top: 150,
        left: 150,
      });
    } else if (shapeType === "line") {
      shape = new fabric.Line([0, 0, 150, 0], {
        stroke: "#00BFFF",
        strokeWidth: 4,
        top: 200,
        left: 50,
      });
    } else if (shapeType === "pentagon") {
      shape = new fabric.Polygon(
        [
          { x: 50, y: 0 },
          { x: 100, y: 40 },
          { x: 80, y: 90 },
          { x: 20, y: 90 },
          { x: 0, y: 40 },
        ],
        { fill: "#32CD32", top: 250, left: 150 }
      );
    } else if (shapeType === "star") {
      shape = new fabric.Polygon(
        [
          { x: 50, y: 0 },
          { x: 65, y: 40 },
          { x: 100, y: 40 },
          { x: 75, y: 65 },
          { x: 85, y: 100 },
          { x: 50, y: 80 },
          { x: 15, y: 100 },
          { x: 25, y: 65 },
          { x: 0, y: 40 },
          { x: 35, y: 40 },
        ],
        { fill: "#FF4500", top: 200, left: 300 }
      );
    }
    if (shape) {
      canvas.add(shape).setActiveObject(shape);
      saveState();
    }
  };

  const addImageFromUrl = (url) => {
    if (!canvas) return;
    fabric.Image.fromURL(
      url,
      (img) => {
        img.scaleToWidth(200);
        canvas.add(img).centerObject(img).renderAll();
        saveState();
      },
      { crossOrigin: "anonymous" }
    );
  };

  const fetchUnsplashImages = async (query) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/images/pre-image?query=${query}`
      );
      if (!res.ok) throw new Error("Unsplash fetch failed");
      const data = await res.json();
      setUnsplashImages(data);
    } catch (err) {
      console.error("❌ Error fetching Unsplash:", err);
    }
  };

  useEffect(() => {
    if (activeImageTab === "pre") {
      fetchUnsplashImages(searchQuery);
    }
  }, [searchQuery, activeImageTab]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("http://localhost:5000/api/images/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const data = await res.json();
      const imageUrl = `http://localhost:5000/${data.filepath}`;
      addImageFromUrl(imageUrl);
      setImages((prev) => [...prev, imageUrl]);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
    e.target.value = "";
  };

  // ===================================================================
  // 🔹 1. STYLES AND HELPER COMPONENT FOR THE NEW SHAPES PANEL
  // ===================================================================
  const shapePanelStyles = {
    title: {
      fontSize: "14px",
      fontWeight: "600",
      margin: "0 0 10px 0",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      color: "#A0A0A0",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "8px",
    },
    button: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 12px",
      border: "none",
      backgroundColor: "#3A3A3A",
      color: "#E0E0E0",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      textAlign: "left",
      transition: "background-color 0.2s ease",
    },
  };

  const ShapeButton = ({ onClick, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const hoverStyle = {
      backgroundColor: isHovered ? "#4A4A4A" : "#3A3A3A",
    };
    return (
      <button
        onClick={onClick}
        style={{ ...shapePanelStyles.button, ...hoverStyle }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </button>
    );
  };
  // ===================================================================

  return (
    <div
      className="left-toolbar"
      style={{
        width: "260px",
        boxSizing: "border-box",
        background: "#1e1e1e",
        color: "#fff",
        padding: "10px",
      }}
    >
      {/* =================================================================== */}
      {/* 🔹 2. REDESIGNED SHAPES SECTION                                    */}
      {/* =================================================================== */}
      {activeTool === "shapes" && (
        <div>
          <h3 style={shapePanelStyles.title}>Shapes</h3>
          <div style={shapePanelStyles.grid}>
            <ShapeButton onClick={() => addShape("rect")}>
              <MdCropSquare size={20} /> Rectangle
            </ShapeButton>
            <ShapeButton onClick={() => addShape("circle")}>
              <MdRadioButtonUnchecked size={20} /> Circle
            </ShapeButton>
            <ShapeButton onClick={() => addShape("triangle")}>
              <MdChangeHistory size={20} /> Triangle
            </ShapeButton>
            <ShapeButton onClick={() => addShape("ellipse")}>
              <MdBlurOn size={20} /> Ellipse
            </ShapeButton>
            <ShapeButton onClick={() => addShape("line")}>
              <MdRemove size={20} /> Line
            </ShapeButton>
            <ShapeButton onClick={() => addShape("pentagon")}>
              <MdPentagon size={20} /> Pentagon
            </ShapeButton>
            <ShapeButton onClick={() => addShape("star")}>
              <MdStarBorder size={20} /> Star
            </ShapeButton>
          </div>
        </div>
      )}
      {/* =================================================================== */}

      {/* 🔹 Edit Tools Section (UNCHANGED) */}
      {activeTool === "edit" && (
        <div>
          <h3>Edit Tools</h3>
          <button onClick={duplicate}>
            <MdContentCopy size={20} /> Duplicate
          </button>
          <button onClick={group}>
            <MdOutlineGroup size={20} /> Group
          </button>
          <button onClick={ungroup}>
            <MdCloseFullscreen size={20} /> Ungroup
          </button>
          <button onClick={bringForward}>
            <MdArrowUpward size={20} /> Bring Forward
          </button>
          <button onClick={sendBackwards}>
            <MdArrowDownward size={20} /> Send Backwards
          </button>
        </div>
      )}

      {/* 🔹 Images Section (UNCHANGED) */}
      {activeTool === "images" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ marginBottom: "5px" }}>Images</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <button
              onClick={() => setActiveImageTab("my")}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: activeImageTab === "my" ? "#b53b74" : "#2d2d2d",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background 0.2s",
              }}
            >
              My Images
            </button>
            <button
              onClick={() => setActiveImageTab("pre")}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: activeImageTab === "pre" ? "#b53b74" : "#2d2d2d",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background 0.2s",
              }}
            >
              Pre-Images
            </button>
          </div>

          {activeImageTab === "my" && (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => uploadInputRef.current?.click()}
                style={{
                  background: "#4d96ff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  color: "#fff",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Upload Image
              </button>
              <input
                type="file"
                accept="image/*"
                ref={uploadInputRef}
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          )}
          {activeImageTab === "pre" && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Unsplash..."
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #333",
                background: "#2d2d2d",
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          )}
          <div
            className="image-grid"
            style={{
              marginTop: "10px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: "10px",
              maxHeight: "500px",
              overflowY: "auto",
              paddingRight: "5px",
            }}
          >
            {activeImageTab === "my"
              ? images.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="image-item"
                    style={{
                      border: "2px solid transparent",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border 0.2s",
                    }}
                    onClick={() => addImageFromUrl(imgUrl)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.border = "2px solid #b53b74")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.border = "2px solid transparent")
                    }
                  >
                    <img
                      src={imgUrl}
                      alt={`uploaded ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "70px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))
              : unsplashImages.map((img, i) => (
                  <div
                    key={i}
                    className="image-item"
                    style={{
                      border: "2px solid transparent",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border 0.2s",
                    }}
                    onClick={() => addImageFromUrl(img.url)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.border = "2px solid #b53b74")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.border = "2px solid transparent")
                    }
                  >
                    <img
                      src={img.thumb}
                      alt={`unsplash ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "70px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* 🔹 Icons Section (UNCHANGED) */}
      {activeTool === "icons" && (
        <div>
          <h3>Icons</h3>
          <IconLibrary />
        </div>
      )}
      {activeTool === "templates" && (
        <div>
          <h3 style={{ marginBottom: "10px" }}>Templates</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "12px",
            }}
          >
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  position: "relative", // ✅ for delete button positioning
                  background: "#2d2d2d",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "transform 0.2s ease, background 0.2s ease",
                }}
                onClick={() => loadTemplate(tpl.id)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#3c3c3c")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#2d2d2d")
                }
              >
                {/* 🔹 Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent loadTemplate on click
                    if (window.confirm(`Delete template "${tpl.name}"?`)) {
                      deleteTemplate(tpl.id);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    background: "transparent",
                    border: "none",
                    color: "#ff6b6b",
                    cursor: "pointer",
                  }}
                >
                  <FiTrash2 size={16} />
                </button>

                <div
                  style={{
                    width: "100%",
                    height: "80px",
                    background: "#444",
                    borderRadius: "6px",
                    marginBottom: "6px",
                  }}
                >
                  {/* later: add thumbnail/preview */}
                </div>
                <span style={{ fontSize: "14px", color: "#fff" }}>
                  {tpl.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftToolbar;
