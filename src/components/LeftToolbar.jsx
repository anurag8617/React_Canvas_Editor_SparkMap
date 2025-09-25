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

// ✅ 1. NEW COMPONENT: An intelligent grid item that adjusts its size.
// It checks the image's dimensions and sets its orientation.
const ImageGridItem = ({ src, onImageClick }) => {
  const [orientation, setOrientation] = useState("landscape"); // Default orientation

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      // If height is significantly greater than width, it's portrait
      if (img.naturalHeight > img.naturalWidth * 1.2) {
        setOrientation("portrait");
      }
    };
  }, [src]);

  const itemStyle = {
    // For portrait images, it will span 3 rows. For landscape/square, it spans 2.
    gridRowEnd: orientation === "portrait" ? "span 3" : "span 2",
    border: "2px solid transparent",
    borderRadius: "6px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "border 0.2s",
  };

  return (
    <div
      className="image-item"
      style={itemStyle}
      onClick={onImageClick}
      onMouseEnter={(e) => (e.currentTarget.style.border = "2px solid #b53b74")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.border = "2px solid transparent")
      }
    >
      <img
        src={src}
        alt="grid item"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

const LeftToolbar = ({ activeTool }) => {
  const {
    canvas,
    saveState,
    duplicate,
    group,
    ungroup,
    bringForward,
    sendBackwards,
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  } = useStore();

  const handleSaveTemplate = async () => {
    if (!canvas) return;
    if (canvas.getObjects().length === 0) {
      alert("Canvas is empty. Add something before saving a template.");
      return;
    }
    const name = prompt("Enter a template name:");
    if (!name) return;
    await saveTemplate(name);
  };

  const uploadInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [activeImageTab, setActiveImageTab] = useState("my");
  const [searchQuery, setSearchQuery] = useState("nature");
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [unsplashError, setUnsplashError] = useState(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/images");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const data = await res.json();
        const imageUrls = data.map((img) => img.url).filter(Boolean);
        setImages(imageUrls);
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
    setUnsplashError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/images/pre-image?query=${encodeURIComponent(
          query
        )}`
      );
      if (!res.ok) {
        throw new Error(
          `Unsplash fetch failed: ${res.status} ${res.statusText}`
        );
      }
      const data = await res.json();
      setUnsplashImages(data);
    } catch (err) {
      console.error("❌ Error fetching Unsplash:", err);
      setUnsplashError("Could not load pre-images. Please try again later.");
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
      const imageUrl = data.url;

      addImageFromUrl(imageUrl);
      setImages((prev) => [...prev, imageUrl]);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }

    e.target.value = "";
  };

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
  const leftToolbarStyle = {
    position: "absolute",
    left: "100%",
    top: 0,
    height: "100%",
    borderRadius: "0.5rem",
    padding: "1rem",
    width: "200px",
  };

  return (
    <div
      style={{
        ...leftToolbarStyle,
        width: "260px",
        boxSizing: "border-box",
        background: "#1e1e1e",
        color: "#fff",
        padding: "10px",
      }}
    >
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
          {activeImageTab === "pre" && unsplashError && (
            <div
              style={{
                color: "#ff6b6b",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {unsplashError}
            </div>
          )}
          <div
            className="image-grid"
            style={{
              marginTop: "10px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              // ✅ 2. STYLE CHANGE: We define a base height for each grid row.
              gridAutoRows: "40px",
              gap: "10px",
              maxHeight: "500px",
              overflowY: "auto",
              paddingRight: "5px",
            }}
          >
            {/* ✅ 3. LOGIC CHANGE: We now use our new ImageGridItem component. */}
            {activeImageTab === "my"
              ? images.map((imgUrl, i) => (
                  <ImageGridItem
                    key={i}
                    src={imgUrl}
                    onImageClick={() => addImageFromUrl(imgUrl)}
                  />
                ))
              : unsplashImages.map((img, i) => (
                  <ImageGridItem
                    key={img.id || i}
                    src={img.thumb}
                    onImageClick={() => addImageFromUrl(img.url)}
                  />
                ))}
          </div>
        </div>
      )}

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
            <button
              onClick={handleSaveTemplate}
              style={{
                backgroundColor: "#1e1e1e",
                color: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                padding: "0.5rem",
                fontSize: "0.875rem",
                width: "100%",
              }}
            >
              💾 Save Template
            </button>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  position: "relative",
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
                    zIndex: 10,
                  }}
                >
                  <FiTrash2 size={16} />
                </button>

                <div
                  style={{
                    width: "100%",
                    height: "80px",
                    marginBottom: "6px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#444",
                  }}
                >
                  {tpl.previewImage ? (
                    <img
                      src={tpl.previewImage}
                      alt={tpl.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "#444",
                      }}
                    ></div>
                  )}
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
