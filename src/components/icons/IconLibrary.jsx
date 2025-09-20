  import React, { useState, useMemo } from "react";
  import * as FaIcons from "react-icons/fa";
  import * as MdIcons from "react-icons/md";
  import * as IoIcons from "react-icons/io5";
  import * as BiIcons from "react-icons/bi";
  import * as GiIcons from "react-icons/gi";
  import * as TbIcons from "react-icons/tb";
  import * as AiIcons from "react-icons/ai";

  import { renderToStaticMarkup } from "react-dom/server";
  import { fabric } from "fabric";
  import { useStore } from "../../store";
  import { FixedSizeGrid as Grid } from "react-window";

  const IconLibrary = () => {
    const [search, setSearch] = useState("");
    const { canvas, saveState } = useStore();

    // Merge all icon libraries into one array
    const iconsArray = useMemo(
      () => [
        ...Object.keys(FaIcons).map((key) => ({
          name: key,
          Component: FaIcons[key],
        })),
        ...Object.keys(MdIcons).map((key) => ({
          name: key,
          Component: MdIcons[key],
        })),
        ...Object.keys(IoIcons).map((key) => ({
          name: key,
          Component: IoIcons[key],
        })),
        ...Object.keys(BiIcons).map((key) => ({
          name: key,
          Component: BiIcons[key],
        })),
        ...Object.keys(GiIcons).map((key) => ({
          name: key,
          Component: GiIcons[key],
        })),
        ...Object.keys(TbIcons).map((key) => ({
          name: key,
          Component: TbIcons[key],
        })),
        ...Object.keys(AiIcons).map((key) => ({
          name: key,
          Component: AiIcons[key],
        })),
      ],
      []
    );

    // Filter icons by search text
    const filteredIcons = useMemo(
      () =>
        iconsArray.filter((icon) =>
          icon.name.toLowerCase().includes(search.toLowerCase())
        ),
      [search, iconsArray]
    );

    // Add icon to Fabric canvas
    const handleAddIcon = (IconComponent) => {
      if (!canvas) return;
      const svgElement = document.createElement("div");
      svgElement.innerHTML = renderToStaticMarkup(<IconComponent size={64} />);
      fabric.loadSVGFromString(svgElement.innerHTML, (objects, options) => {
        const iconObj = fabric.util.groupSVGElements(objects, options);
        iconObj.set({ left: 100, top: 100, scaleX: 0.1, scaleY: 0.1 });
        canvas.add(iconObj);
        canvas.setActiveObject(iconObj);
        canvas.renderAll();
        saveState();
      });
    };

    // Grid config
    const columnCount = 5; // 5 icons per row
    const itemSize = 45; // width/height per icon cell

    const Cell = ({ columnIndex, rowIndex, style }) => {
      const index = rowIndex * columnCount + columnIndex;
      if (index >= filteredIcons.length) return null;

      const { name, Component } = filteredIcons[index];
      return (
        <div style={{ ...style, padding: "5px" }}>
          <button
            key={name}
            title={name}
            onClick={() => handleAddIcon(Component)}
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Component size={20} color="white" />
          </button>
        </div>
      );
    };

    return (
      <div
        style={{
          padding: "10px",
          // width: "280px",
          background: "#1e1e1e",
          color: "#fff",
          borderTop: "1px solid #333",
          boxSizing: "border-box",
        }}
      >
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "5px",
            // border: "1px solid #444",
            marginBottom: "10px",
            background: "#2a2a2a",
            color: "#fff",
          }}
        />

        {/* Virtualized Grid */}
        <Grid
          columnCount={columnCount}
          columnWidth={itemSize}
          height={500}
          rowCount={Math.ceil(filteredIcons.length / columnCount)}
          rowHeight={itemSize}
          width={250}
        >
          {Cell}
        </Grid>
      </div>
    );
  };

  export default IconLibrary;
