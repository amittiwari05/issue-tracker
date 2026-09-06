import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../../../utils/utils";
import axios from "axios";
import "./login.css";

const Login = () => {
  const API_URL  = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) return handleError("Email and password are required");

    try {
      const { data } = await axios.post(`${API_URL}/user/login`, loginInfo);
      if (data.success) {
        handleSuccess(data.message);
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          if (data.user.role === "admin") navigate("/admin/dashboard");
          else navigate("/home");
        }, 1000);
      } else {
        handleError(data.message || "Login failed");
      }
    } catch (err) {
      handleError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pt-20"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Tricolor top bar */}
        <div className="tricolor-bar absolute top-0 left-0 right-0" />

        {/* Heading */}
        <div className="text-center mb-8 mt-2">
          {/* Ashoka wheel icon */}
          <div className="flex justify-center mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--saffron)", boxShadow: "var(--shadow-glow-saffron)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" />
                <circle cx="12" cy="12" r="2.5" fill="white" />
                <line x1="12" y1="3" x2="12" y2="21" stroke="white" strokeWidth="1.2" opacity=".65" />
                <line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.2" opacity=".65" />
                <line x1="5.4" y1="5.4" x2="18.6" y2="18.6" stroke="white" strokeWidth="1" opacity=".4" />
                <line x1="18.6" y1="5.4" x2="5.4" y2="18.6" stroke="white" strokeWidth="1" opacity=".4" />
              </svg>
            </div>
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
          >
            Login
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            स्वागत है — Welcome back
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
            </label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={loginInfo.email}
              className="bubble-input w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
              onFocus={e  => e.target.style.borderColor = "var(--saffron)"}
              onBlur={e   => e.target.style.borderColor = "var(--border-medium)"}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={loginInfo.password}
              className="bubble-input w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
              onFocus={e => e.target.style.borderColor = "var(--saffron)"}
              onBlur={e  => e.target.style.borderColor = "var(--border-medium)"}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-85"
            style={{
              background: "var(--saffron)",
              color: "#FFF5E8",
              boxShadow: "var(--shadow-glow-saffron)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.5px",
            }}
          >
            Login
          </button>

          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold hover:underline"
              style={{ color: "var(--saffron-lt)" }}
            >
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
