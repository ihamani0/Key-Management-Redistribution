import React from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./authSlice";
import { Navigate } from "react-router-dom";

function AuthGuard({ children }) {
  const isAuthnticated = useSelector(selectIsAuthenticated);
  return isAuthnticated ? children : <Navigate to="/login" replace />;
}

export default AuthGuard;
