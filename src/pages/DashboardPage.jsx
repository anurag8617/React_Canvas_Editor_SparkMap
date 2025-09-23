import React, { useState } from "react";
import LeftToolbar from "../components/LeftToolbar";
import FabricCanvas from "../components/FabricCanvas";
import RightPropertiesPanel from "../components/RightPropertiesPanel";
import Header from "../components/Header";
import PrimaryToolbar from "../components/PrimaryToolbar";
import PageSlider from "../components/PageSlider";
import { useStore } from "../store";

const DashboardPage = () => {
  const { isPresentationMode } = useStore();
  const [activeTool, setActiveTool] = useState(null);

  const containerClassName = isPresentationMode
    ? "app-container presentation-mode"
    : "app-container";

  return (
    <div className={containerClassName}>
      <div className="left-column" onMouseLeave={() => setActiveTool(null)}>
        <PrimaryToolbar setActiveTool={setActiveTool} activeTool={activeTool} />
        {activeTool && <LeftToolbar activeTool={activeTool} />}
      </div>
      <main className="main-content">
        <Header />
        <div className="canvas-panel">
          <FabricCanvas />
        </div>
        <PageSlider />
      </main>
      <RightPropertiesPanel />
    </div>
  );
};

export default DashboardPage;
