import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../../../utils/utils";
import axios from "axios";
import "./signup.css";

const Signup = () => {
  const API_URL  = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [signupInfo, setSignupInfo] = useState({ name: "", email: "", password: "", profilePic: "" });
  const [preview, setPreview] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic" && files?.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignupInfo((prev) => ({ ...prev, profilePic: reader.result }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSignupInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) return handleError("Name, email, and password are required");
    try {
      const { data } = await axios.post(`${API_URL}/user/signup`, signupInfo);
      if (data.success) {
        handleSuccess(data.message);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        handleError(data.message || "Signup failed");
      }
    } catch (err) {
      handleError(err.response?.data?.message || "Signup failed");
    }
  };

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-medium)",
    color: "var(--text-primary)",
  };
  const focusIn  = (e) => e.target.style.borderColor = "var(--saffron)";
  const focusOut = (e) => e.target.style.borderColor = "var(--border-medium)";

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
          <div className="flex justify-center mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--teal)", boxShadow: "0 0 18px rgba(0,124,110,0.35)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
              </svg>
            </div>
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
          >
            Signup
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            पंजीकरण करें — Create your account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {[
            { label: "Name",     name: "name",     type: "text",     placeholder: "Enter your name" },
            { label: "Email",    name: "email",    type: "email",    placeholder: "Enter your email" },
            { label: "Password", name: "password", type: "password", placeholder: "Enter your password" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                {label}
              </label>
              <input
                onChange={handleChange}
                type={type}
                name={name}
                placeholder={placeholder}
                value={signupInfo[name]}
                className="bubble-input w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          ))}

          {/* Profile picture */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Profile Picture <span style={{ color: "var(--text-muted)" }}>(optional)</span>
            </label>
            <input
              onChange={handleChange}
              type="file"
              name="profilePic"
              accept="image/*"
              className="w-full rounded-lg px-4 py-2 text-sm focus:outline-none"
              style={{
                ...inputStyle,
                // file button styling
              }}
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 w-16 h-16 object-cover rounded-full"
                style={{ border: "2px solid var(--saffron)" }}
              />
            )}
          </div>

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
            Create Account
          </button>

          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--saffron-lt)" }}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
