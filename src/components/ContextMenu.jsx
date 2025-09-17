import React, { useEffect, useRef } from "react";
import { useStore } from "../store";
import {
  FiCopy,
  FiClipboard,
  FiScissors,
  FiTrash2,
  FiBox as FiGroup,
  FiGrid as FiUngroup,
} from "react-icons/fi";

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

  // ✅ FIX: This effect now handles closing the menu correctly and safely.
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if it's a LEFT-CLICK (button 0) and the click is outside the menu.
      if (
        event.button === 0 &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    // We add the listener on a timeout to prevent it from catching the same click that opened it.
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
        </>
      )}
    </div>
  );
};

export default ContextMenu;
