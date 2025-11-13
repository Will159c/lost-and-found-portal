
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function GuestOnly({ children }) { 
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading) return null;
  return user ? <Navigate to={location.state?.from || "/messages"} replace /> : children;
}
