// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {   // <-- default export
  const { user, token, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null; // or a spinner

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
