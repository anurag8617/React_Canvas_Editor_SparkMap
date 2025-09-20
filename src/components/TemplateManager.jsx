// src/components/TemplateManager.js
import React, { useEffect, useState } from "react";
import { useStore } from "../store";

const TemplateManager = () => {
  const { canvas } = useStore();
  const [templates, setTemplates] = useState([]);

  // Fetch templates on load
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/templates");
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("❌ Failed to load templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  // Save current canvas as a template
  const handleSaveTemplate = async () => {
    if (!canvas) return;

    const name = prompt("Enter template name:");
    if (!name) return;

    const json = canvas.toJSON();

    try {
      await fetch("http://localhost:5000/api/templates/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, data: json }),
      });
      alert("✅ Template saved!");
      // refresh templates list
      const res = await fetch("http://localhost:5000/api/templates");
      setTemplates(await res.json());
    } catch (err) {
      console.error("❌ Failed to save template:", err);
    }
  };

  // Load a template by ID
  const handleLoadTemplate = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/templates/${id}`);
      const template = await res.json();

      if (template?.data && canvas) {
        canvas.loadFromJSON(template.data, () => {
          canvas.renderAll();
        });
      }
    } catch (err) {
      console.error("❌ Failed to load template:", err);
    }
  };

  return (
    <div className="template-manager">
      <h3>📑 Templates</h3>

      <button onClick={handleSaveTemplate}>Save Current Canvas</button>

      <div style={{ marginTop: "1rem" }}>
        {templates.length === 0 ? (
          <p style={{ color: "#888" }}>No templates saved yet.</p>
        ) : (
          <ul>
            {templates.map((tpl) => (
              <li key={tpl.id} style={{ marginBottom: "0.5rem" }}>
                {tpl.name}{" "}
                <button onClick={() => handleLoadTemplate(tpl.id)}>Load</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
