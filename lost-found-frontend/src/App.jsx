import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import EmailVerifyBanner from "./components/EmailVerifyBanner.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/home/Home.jsx";
import Login from "./pages/login/Login.jsx";
import Signup from "./pages/login/Signup.jsx";
import Messages from "./pages/messages/Messages.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ForgotUsername from "./pages/ForgotUsername.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import AdminMessages from "./pages/admin/AdminMessages.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <EmailVerifyBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <AdminMessages />
              </ProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-username" element={<ForgotUsername />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}