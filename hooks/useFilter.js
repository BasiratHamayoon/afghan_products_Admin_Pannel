"use client";

import { useState, useMemo } from "react";

export function useFilter(data = [], initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(initialFilters);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === "all") return true;
        return item[key] === value;
      });
    });
  }, [data, filters]);

  return { filters, filteredData, updateFilter, resetFilters };
}