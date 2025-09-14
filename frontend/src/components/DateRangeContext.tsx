"use client";

import React, { createContext, useState } from "react";

export const DateRangeContext = createContext<{
  dateRange: { from?: Date; to?: Date };
  setDateRange: React.Dispatch<
    React.SetStateAction<{ from?: Date; to?: Date }>
  >;
}>({ dateRange: {}, setDateRange: () => {} });

export const DateRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};
