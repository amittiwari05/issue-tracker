import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./pages/header/Header";
import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import PostIssue from "./pages/post/Post";
import { handleError } from "./utils/utils";
import { useRef, useEffect } from "react";
import IssueDetails from "./pages/post/IssueDetails";
import Profile from "./pages/profile/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./pages/admin/AdminRoute";
import LandingPage from "./pages/landing/LandingPage";
import ChatBot from "./components/ChatBot";          {/* ✅ ADD THIS LINE */}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const hasShownToast = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (!token && !hasShownToast.current) {
      handleError("Login required!");
      hasShownToast.current = true;
    }
  }, [token, location]);

  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        {/* Welcome / landing page */}
        <Route path="/"    element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />

        {/* Issues dashboard (public) */}
        <Route path="/home"    element={<Dashboard />} />

        {/* Protected */}
        <Route path="/post"        element={<ProtectedRoute><PostIssue /></ProtectedRoute>} />
        <Route path="/issue/:id"   element={<ProtectedRoute><IssueDetails /></ProtectedRoute>} />
        <Route path="/profile"     element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>

      <ChatBot />     {/* ✅ ADD THIS LINE — renders the floating bot on every page */}
    </div>
  );
}

export default App;
