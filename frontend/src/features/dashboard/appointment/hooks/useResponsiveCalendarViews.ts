import { useEffect, useState } from "react";
import type { View } from "react-big-calendar";

export const useResponsiveCalendarViews = () => {
  const [calendarView, setCalendarView] = useState<View>("month");
  const [availableViews, setAvailableViews] = useState<View[]>(["month", "week", "day", "agenda"]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 768px)");
    const apply = () => {
      if (mql.matches) {
        setCalendarView("agenda");
        setAvailableViews(["agenda", "week"]);
      } else {
        setCalendarView("month");
        setAvailableViews(["month", "week", "day", "agenda"]);
      }
    };

    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return { calendarView, setCalendarView, availableViews };
};
