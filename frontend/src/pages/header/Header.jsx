import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, Shield } from "lucide-react";
import "./Header.css";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "../../context/ThemeContext";

const navLinks = [
  { name: "Home",   path: "/" },
  { name: "Issues", path: "/home" },
  { name: "Post",   path: "/post" },
];

/* ── Theme toggle ── */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-track"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle-knob">
        {theme === "dark" ? "🌙" : "☀️"}
      </div>
    </button>
  );
};

const Header = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin,  setIsAdmin]  = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") setIsAdmin(true);
      } catch (err) { console.error("Invalid token:", err); }
    }
  }, [token]);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const btnSaffron = {
    background: "var(--saffron)",
    color: "var(--bg-base)",
    boxShadow: "var(--shadow-glow-saffron)",
  };
  const btnGold = { background: "var(--gold-lt)", color: "var(--bg-base)" };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1.5px solid var(--border-medium)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="tricolor-bar w-full" />

      <div
        className="rangoli-bg h-16 flex items-center px-6 md:px-10"
        style={{ color: "var(--text-primary)" }}
      >
        {/* ── Mobile ── */}
        <div className="flex w-full items-center justify-between md:hidden relative">
          <button className="z-20" onClick={() => setMenuOpen((o) => !o)} style={{ color: "var(--text-primary)" }}>
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}>
              Issue Tracker
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* ── Desktop ── */}
        <div className="hidden md:flex w-full items-center justify-between">
          {/* Logo */}
          <div className="shrink-0 cursor-pointer flex items-center gap-3" onClick={() => navigate("/")}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--saffron)", boxShadow: "0 2px 10px rgba(232,101,10,0.4)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
                <circle cx="10" cy="10" r="2" fill="white"/>
                <line x1="10" y1="2.5" x2="10" y2="17.5" stroke="white" strokeWidth="1" opacity=".65"/>
                <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="white" strokeWidth="1" opacity=".65"/>
                <line x1="4.4" y1="4.4" x2="15.6" y2="15.6" stroke="white" strokeWidth="1" opacity=".4"/>
                <line x1="15.6" y1="4.4" x2="4.4" y2="15.6" stroke="white" strokeWidth="1" opacity=".4"/>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                Issue Tracker
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                जन सेवा • नागरिक मंच
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex gap-3 items-center">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative px-3 py-1.5 rounded-lg text-sm font-medium overflow-hidden"
                  style={{
                    color: active ? "var(--saffron-lt)" : "var(--text-secondary)",
                    background: active ? "var(--saffron-dim)" : "transparent",
                    fontWeight: active ? 600 : 400,
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--saffron-lt)";
                      e.currentTarget.style.background = "var(--saffron-dim)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r"
                      style={{ background: "var(--saffron)" }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}

            <ThemeToggle />

            {isAdmin && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm"
                style={btnGold}
              >
                <Shield size={14} className="mr-1.5" /> Admin Panel
              </button>
            )}

            {token ? (
              <button
                onClick={() => navigate("/profile")}
                className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm"
                style={btnSaffron}
              >
                <User size={14} className="mr-1.5" /> Profile
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm"
                style={btnSaffron}
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div
          className="absolute top-[67px] left-0 w-full flex flex-col items-center gap-4 py-6 md:hidden animate-slide-down"
          style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-medium)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-lg font-medium"
              style={{ color: isActive(link.path) ? "var(--saffron-lt)" : "var(--text-secondary)" }}
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="inline-flex items-center px-5 py-2 rounded-lg font-semibold"
              style={btnGold}
            >
              <Shield size={14} className="mr-1.5" /> Admin Panel
            </button>
          )}
          {token ? (
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center px-5 py-2 rounded-lg font-semibold"
              style={btnSaffron}
            >
              <User size={14} className="mr-1.5" /> Profile
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center px-5 py-2 rounded-lg font-semibold"
              style={btnSaffron}
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

