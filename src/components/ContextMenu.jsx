// import React, { useEffect, useRef } from "react";
// import { useStore } from "../store";
// import {
//   MdDelete,
//   MdContentCopy,
//   MdGroup,
//   MdOutlineGroupWork,
// } from "react-icons/md";

// const ContextMenu = ({ x, y, target, onClose }) => {
//   const { canvas, deleteActiveObjects, duplicate, group, ungroup } = useStore();
//   const menuRef = useRef(null);

//   // Close the menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         onClose();
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [onClose]);

//   // Handle menu actions
//   const handleAction = (action) => {
//     switch (action) {
//       case "delete":
//         // Check if the target is an 'activeSelection' (multi-select)
//         if (target?.type === "activeSelection") {
//           target.forEachObject((obj) => canvas.remove(obj));
//           canvas.discardActiveObject().requestRenderAll();
//         } else if (target) {
//           // If it's a single object, remove it directly.
//           canvas.remove(target);
//           canvas.requestRenderAll(); // Make sure the canvas re-renders
//         }
//         break;
//       case "duplicate":
//         duplicate();
//         break;
//       case "group":
//         group();
//         break;
//       case "ungroup":
//         ungroup();
//         break;
//       default:
//         break;
//     }
//     onClose(); // Close the menu after an action
//   };

//   // Menu visibility rules
//   const isGroup = target?.type === "group";
//   const isMultiSelect = target?.type === "activeSelection";
//   const isObject = target && !isMultiSelect && !isGroup;
//   const hasMultipleSelected =
//     isMultiSelect || canvas?.getActiveObjects().length > 1;

//   return (
//     <div
//       ref={menuRef}
//       className="context-menu"
//       style={{
//         position: "absolute",
//         top: y,
//         left: x,
//         background: "rgba(51, 48, 48, 0.2)",
//         backdropFilter: "blur(6px)",
//         border: "1px solid rgba(200,200,200,0.6)",
//         borderRadius: "3px",
//         boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
//         padding: "6px 0",
//         minWidth: "180px",
//         zIndex: 1000,
//         fontFamily: "Segoe UI, sans-serif",
//         fontSize: "14px",
//       }}
//     >
//       {isObject && (
//         <>
//           <MenuItem
//             icon={<MdContentCopy />}
//             label="Duplicate"
//             onClick={() => handleAction("duplicate")}
//           />
//           <MenuItem
//             icon={<MdDelete />}
//             label="Delete"
//             danger
//             onClick={() => handleAction("delete")}
//           />
//           <Divider />
//         </>
//       )}

//       {isGroup && (
//         <>
//           <MenuItem
//             icon={<MdOutlineGroupWork />}
//             label="Ungroup"
//             onClick={() => handleAction("ungroup")}
//           />
//           <Divider />
//         </>
//       )}

//       {hasMultipleSelected && !isGroup && (
//         <>
//           <MenuItem
//             icon={<MdGroup />}
//             label="Group"
//             onClick={() => handleAction("group")}
//           />
//           <Divider />
//         </>
//       )}

//       {!target && <MenuItem label="Add Item" onClick={() => onClose()} />}
//     </div>
//   );
// };

// // -------------------
// // Reusable Subcomponents
// // -------------------
// const MenuItem = ({ icon, label, onClick, danger }) => {
//   return (
//     <button
//       onClick={onClick}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: "10px",
//         width: "100%",
//         padding: "8px 14px",
//         background: "transparent",
//         border: "none",
//         outline: "none",
//         fontSize: "14px",
//         color: danger ? "#d9534f" : "#333",
//         cursor: "pointer",
//         textAlign: "left",
//       }}
//       onMouseEnter={(e) =>
//         (e.currentTarget.style.background = danger
//           ? "rgba(217,83,79,0.1)"
//           : "#f5f5f5")
//       }
//       onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
//     >
//       {icon && <span style={{ fontSize: "16px" }}>{icon}</span>}
//       <span>{label}</span>
//     </button>
//   );
// };

// const Divider = () => (
//   <div
//     style={{
//       height: "1px",
//       background: "#eee",
//       margin: "4px 0",
//     }}
//   />
// );

// export default ContextMenu;

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
