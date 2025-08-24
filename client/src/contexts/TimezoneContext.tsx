import { createContext, useContext, useState } from "react";

type Timezone = "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "UTC";

interface TimezoneContextType {
  timezone: Timezone;
  setTimezone: (timezone: Timezone) => void;
  formatDate: (date: string | Date) => string;
  formatDateTime: (date: string | Date) => string;
}

const timezoneNames = {
  "America/New_York": "Eastern Time",
  "America/Chicago": "Central Time", 
  "America/Denver": "Mountain Time",
  "America/Los_Angeles": "Pacific Time",
  "UTC": "UTC",
};

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezone] = useState<Timezone>(() => {
    const saved = localStorage.getItem("timezone");
    return (saved as Timezone) || "America/New_York";
  });

  const handleSetTimezone = (newTimezone: Timezone) => {
    setTimezone(newTimezone);
    localStorage.setItem("timezone", newTimezone);
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <TimezoneContext.Provider value={{ 
      timezone, 
      setTimezone: handleSetTimezone, 
      formatDate, 
      formatDateTime 
    }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return context;
}