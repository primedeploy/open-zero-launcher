import { useState, useEffect } from "react";

export function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");

  return `${displayHours}:${displayMinutes}`;
}

export function formatPeriod(date: Date) {
  return date.getHours() >= 12 ? "PM" : "AM";
}

export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export function useClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    time,
    formattedTime: formatTime(time),
    formattedPeriod: formatPeriod(time),
    formattedDate: formatDate(time),
  };
}
