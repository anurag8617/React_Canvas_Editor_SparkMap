import React, { useEffect, useRef } from "react";
import { useStore } from "../store";
import {
  FiCopy,
  FiClipboard,
  FiScissors,
  FiTrash2,
  FiBox as FiGroup,
  FiGrid as FiUngroup,
  FiDownload,
} from "react-icons/fi";
import { fabric } from "fabric"; // needed for StaticCanvas
  
const MenuItem = ({ icon, label, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      width: "100%",
      padding: "8px 12px",
      background: "transparent",
      border: "none",
      color: disabled ? "#888" : "#f0f0f0",
      cursor: disabled ? "not-allowed" : "pointer",
      textAlign: "left",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {icon} <span>{label}</span>
  </button>
);

const ContextMenu = ({ x, y, target, onClose }) => {
  const {
    cut,
    copy,
    paste,
    duplicate,
    deleteSelection,
    group,
    ungroup,
    clipboard,
  } = useStore();
  const menuRef = useRef(null);

  // ✅ Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.button === 0 &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleAction = (action) => {
    if (action) action();
    onClose();
  };

  const isGroup = target?.type === "group";
  const isMultiSelect = target?.type === "activeSelection";
  const canPaste = !!clipboard;

  // ✅ Download selection function
  const exportActiveObject = (format = "png") => {
    const { canvas } = useStore.getState();
    const activeObject = canvas?.getActiveObject();
    if (!activeObject) {
      alert("No object selected!");
      return;
    }

    activeObject.clone((cloned) => {
      const bounds = cloned.getBoundingRect();
      const tempCanvas = new fabric.StaticCanvas(null, {
        width: bounds.width,
        height: bounds.height,
      });

      cloned.set({
        left: cloned.left - bounds.left,
        top: cloned.top - bounds.top,
      });

      tempCanvas.add(cloned);
      tempCanvas.renderAll();

      if (format === "svg") {
        const svg = tempCanvas.toSVG();
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "element.svg";
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const dataURL = tempCanvas.toDataURL({
          format,
          quality: 1,
          enableRetinaScaling: true,
        });

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `element.${format}`;
        link.click();
      }

      tempCanvas.dispose();
    });
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 1000,
        width: "200px",
        background: "#2a2a2a",
        border: "1px solid #555",
        borderRadius: "8px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        padding: "5px",
      }}
    >
      {target && (
        <>
          <MenuItem
            icon={<FiScissors size={14} />}
            label="Cut"
            onClick={() => handleAction(cut)}
          />
          <MenuItem
            icon={<FiCopy size={14} />}
            label="Copy"
            onClick={() => handleAction(copy)}
          />
        </>
      )}
      <MenuItem
        icon={<FiClipboard size={14} />}
        label="Paste"
        onClick={() => handleAction(paste)}
        disabled={!canPaste}
      />
      {target && (
        <MenuItem
          icon={<FiCopy size={14} />}
          label="Duplicate"
          onClick={() => handleAction(duplicate)}
        />
      )}
      {isMultiSelect && (
        <MenuItem
          icon={<FiGroup size={14} />}
          label="Group"
          onClick={() => handleAction(group)}
        />
      )}
      {isGroup && (
        <MenuItem
          icon={<FiUngroup size={14} />}
          label="Ungroup"
          onClick={() => handleAction(ungroup)}
        />
      )}
      {target && (
        <>
          <hr style={{ border: "1px solid #555", margin: "5px 0" }} />
          <MenuItem
            icon={<FiTrash2 size={14} />}
            label="Delete"
            onClick={() => handleAction(deleteSelection)}
          />
          <hr style={{ border: "1px solid #555", margin: "5px 0" }} />
          {/* ✅ New Download Options */}
          <MenuItem
            icon={<FiDownload size={14} />}
            label="Download Selection PNG"
            onClick={() => exportActiveObject("png")}
          />
          <MenuItem
            icon={<FiDownload size={14} />}
            label="Download Selection JPG"
            onClick={() => exportActiveObject("jpg")}
          />
          <MenuItem
            icon={<FiDownload size={14} />}
            label="Download Selection SVG"
            onClick={() => exportActiveObject("svg")}
          />
        </>
      )}
    </div>
  );
};

export default ContextMenu;
