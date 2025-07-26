import React, { useState } from 'react';

const DebugPanel = ({ data, title = "Debug Data" }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700"
      >
        {isOpen ? 'Hide' : 'Show'} Debug
      </button> */}
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="p-4 overflow-y-auto max-h-80">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 