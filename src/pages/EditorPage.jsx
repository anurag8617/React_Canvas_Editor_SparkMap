import React from "react";
import PrimaryToolbar from "../components/PrimaryToolbar";
import RightPropertiesPanel from "../components/RightPropertiesPanel";
import TemplateManager from "../components/TemplateManager";

const EditorPage = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* Left Toolbar */}
      <PrimaryToolbar />

      {/* Canvas container */}
      <div style={{ flex: 1 }}>
        <canvas id="canvas" />
      </div>

      {/* Right Panel */}
      <div style={{ width: "300px" }}>
        <RightPropertiesPanel />
        <TemplateManager />
      </div>
    </div>
  );
};

export default EditorPage;
