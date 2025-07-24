import React, { useState } from "react";

const ModuleList = ({ modules }) => {
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  const toggleContent = (id) => {
    setExpandedModuleId((prevId) => (prevId === id ? null : id));
  };

  return (
    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
      {modules.map((mod) => (
        <li
          key={mod.id}
          className="bg-white p-2 rounded border border-gray-200"
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span>{mod.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => toggleContent(mod.id)}
                className="border border-blue-600 text-blue-600 px-3 py-0.5 rounded hover:bg-blue-600 hover:text-white transition text-sm"
              >
                {expandedModuleId === mod.id ? "Hide" : "View"}
              </button>
              <button className="border border-green-600 text-green-600 px-3 py-0.5 rounded hover:bg-green-600 hover:text-white transition text-sm">
                Edit
              </button>
            </div>
          </div>

          {/* Toggleable content */}
          {expandedModuleId === mod.id && mod.content && (
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-line border-t pt-2">
              {mod.content}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ModuleList;
