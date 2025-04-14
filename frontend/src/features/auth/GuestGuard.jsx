import React from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./authSlice";
import { Navigate } from "react-router-dom";

function GuestGuard({ children }) {
  const isAuthnticated = useSelector(selectIsAuthenticated);

  return !isAuthnticated ? children : <Navigate to="/dashboard" replace />;
}

export default GuestGuard;
