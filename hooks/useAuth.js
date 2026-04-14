"use client";

import { useSelector } from "react-redux";

export function useAuth() {
  const { user, isAuthenticated, isLoading, token } = useSelector((state) => state.auth);
  return { user, isAuthenticated, isLoading, token };
}