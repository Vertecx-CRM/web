"use client";

import React from "react";
// @ts-ignore → si no usas la opción 1
import TimeGrid from "react-big-calendar/lib/TimeGrid";
import { addDays, startOfWeek } from "date-fns";

const CustomWeek = (props: any) => {
  const { date } = props;

  // Lunes → sábado
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = addDays(start, 5);

  return (
    <TimeGrid
      {...props}
      range={[start, end]}
      eventOffset={15}
    />
  );
};

export default CustomWeek;
