"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

export function useSearch(data = [], keys = []) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return data;
    const q = debouncedQuery.toLowerCase();
    return data.filter((item) =>
      keys.some((key) => {
        const val = item[key];
        return val && val.toString().toLowerCase().includes(q);
      })
    );
  }, [data, debouncedQuery, keys]);

  return { query, setQuery, results };
}