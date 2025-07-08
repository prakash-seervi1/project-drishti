import React, { useState, useEffect } from 'react';
import { formatTimestamp } from '../utils/timestamp';

const TimeAgo = ({ timestamp, className = "text-sm text-gray-500" }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatTimestamp(timestamp));
    };

    // Update immediately
    updateTimeAgo();

    // Update every minute
    const interval = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className={className} title={timestamp ? new Date(timestamp?._seconds ? timestamp._seconds * 1000 : timestamp).toLocaleString() : ''}>
      {timeAgo}
    </span>
  );
};

// Utility function for backward compatibility
export const timeAgo = formatTimestamp;

export default TimeAgo; 