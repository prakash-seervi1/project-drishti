import React from 'react';
import { formatTimestamp } from '../utils/timestamp';

const TimestampTest = () => {
  // Test Firebase timestamp
  const firebaseTimestamp = {
    _seconds: 1751821108,
    _nanoseconds: 420000000
  };

  // Test regular timestamp
  const regularTimestamp = new Date();

  // Test string timestamp
  const stringTimestamp = "2025-07-06T18:49:21.463Z";

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="font-semibold text-gray-800 mb-2">Timestamp Test</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Firebase Timestamp:</strong>
          <div className="text-xs bg-gray-100 p-1 rounded">
            {JSON.stringify(firebaseTimestamp)}
          </div>
          <div className="text-green-600">
            Formatted: {formatTimestamp(firebaseTimestamp)}
          </div>
        </div>
        <div>
          <strong>Regular Timestamp:</strong>
          <div className="text-green-600">
            Formatted: {formatTimestamp(regularTimestamp)}
          </div>
        </div>
        <div>
          <strong>String Timestamp:</strong>
          <div className="text-green-600">
            Formatted: {formatTimestamp(stringTimestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampTest; 