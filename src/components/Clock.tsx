import "../app/globals.css";

import { useState, useEffect } from "react";

export const Clock = () => {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );

      setDate(
        now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }),
      );
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 60 * 1000); // Update every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="flex flex-col items-end text-xs font-mono">
      <span className="m-0 p-0">{time}</span>
      <span className="m-0 p-0 text-black">{date}</span>
    </div>
  );
};

export default Clock;
