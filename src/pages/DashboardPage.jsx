// import React, { useState } from "react";
// import LeftToolbar from "../components/LeftToolbar";
// import FabricCanvas from "../components/FabricCanvas";
// import RightPropertiesPanel from "../components/RightPropertiesPanel";
// import Header from "../components/Header";
// import PrimaryToolbar from "../components/PrimaryToolbar";
// import PageSlider from "../components/PageSlider";
// import { useStore } from "../store";

// const DashboardPage = () => {
//   const { isPresentationMode } = useStore();
//   const [activeTool, setActiveTool] = useState(null);

//   const containerClassName = isPresentationMode
//     ? "app-container presentation-mode"
//     : "app-container";

//   return (
//     <div className={containerClassName}>
//       <div className="left-column" onMouseLeave={() => setActiveTool(null)}>
//         <PrimaryToolbar setActiveTool={setActiveTool} activeTool={activeTool} />
//         {activeTool && <LeftToolbar activeTool={activeTool} />}
//       </div>
//       <main className="main-content">
//         <Header />
//         <div className="canvas-panel">
//           <FabricCanvas />
//         </div>
//         <PageSlider />
//       </main>
//       <RightPropertiesPanel />
//     </div>
//   );
// };

// export default DashboardPage;

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

  const appContainerStyle = {
    display: "flex",
    height: "100vh",
  };

  const leftColumnStyle = {
    position: "relative",
    zIndex: 2,
    display: "flex",
    gap: "1rem",
    backgroundColor: "#2a2a2a",
    flexShrink: 0,
  };

  const mainContentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    minWidth: 0,
    position: "relative",
    zIndex: 1,
  };

  const canvasPanelStyle = {
    flex: 1,
    width: "100%",
    borderRadius: "0.5rem",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (isPresentationMode) {
    leftColumnStyle.display = "none";
    mainContentStyle.padding = 0;
  }

  return (
    <div style={appContainerStyle}>
      <div
        className="left-column"
        style={leftColumnStyle}
        onMouseLeave={() => setActiveTool(null)}
      >
        <PrimaryToolbar setActiveTool={setActiveTool} activeTool={activeTool} />
        {activeTool && <LeftToolbar activeTool={activeTool} />}
      </div>
      <main className="main-content" style={mainContentStyle}>
        <Header />
        <div className="canvas-panel" style={canvasPanelStyle}>
          <FabricCanvas />
        </div>
        <PageSlider />
      </main>
      <RightPropertiesPanel />
    </div>
  );
};

export default DashboardPage;
