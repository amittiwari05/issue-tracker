import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { handleError } from "../../utils/utils";

const Dashboard = () => {
  const [issues, setIssues]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ city: "", state: "", category: "", severity: "" });
  const API_URL  = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get(`${API_URL}/issues`);
        setIssues(res.data.issues);
        setFiltered(res.data.issues);
      } catch {
        handleError("Failed to fetch issues");
      }
    };
    fetchIssues();
  }, [API_URL]);

  useEffect(() => {
    let data = [...issues];
    Object.entries(filters).forEach(([key, val]) => {
      if (val) data = data.filter((i) => i.location?.[key] === val || i[key] === val);
    });
    setFiltered(data);
  }, [filters, issues]);

  const unique = (arr, key) =>
    [...new Set(arr.map((i) => i.location?.[key] || i[key]))].filter(Boolean);

  /* ── severity → colour mapping ── */
  const severityColor = {
    Low:      "var(--teal-lt)",
    Medium:   "var(--gold-lt)",
    High:     "var(--saffron-lt)",
    Critical: "var(--crimson-lt)",
  };

  const statusColor = {
    Done:    "var(--status-done)",
    Working: "var(--status-working)",
    Pending: "var(--status-pending)",
  };

  return (
    <div
      className="min-h-screen px-6 pt-24 pb-12"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Page heading */}
      <div className="text-center mb-2">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
        >
          Reported Issues
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          नागरिक शिकायत मंच — Citizen Grievance Platform
        </p>
        {/* Kolam divider */}
        <div className="kolam-divider w-32 mx-auto mt-3" />
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 mt-6">
        {["city", "state", "category", "severity"].map((key) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="">{key.charAt(0).toUpperCase() + key.slice(1)}</option>
            {unique(issues, key).map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        ))}

        <button
          onClick={() => setFilters({ city: "", state: "", category: "", severity: "" })}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: "var(--saffron)", color: "#FFF5E8" }}
        >
          Reset
        </button>
      </div>

      {/* ── Cards grid ── */}
      {filtered.length === 0 ? (
        <p className="text-center" style={{ color: "var(--text-muted)" }}>
          No issues found.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((issue, idx) => (
            <div
              key={issue._id}
              onClick={() => navigate(`/issue/${issue._id}`)}
              className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] animate-row-in"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
                animationDelay: `${idx * 40}ms`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = "1px solid var(--border-medium)";
                e.currentTarget.style.boxShadow = "var(--shadow-glow-saffron)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = "1px solid var(--border-subtle)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="w-full h-48 object-cover"
                />
                {/* Severity badge overlay */}
                <span
                  className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-md"
                  style={{
                    background: "rgba(15,7,0,0.75)",
                    color: severityColor[issue.severity] || "var(--text-secondary)",
                    border: `1px solid ${severityColor[issue.severity] || "var(--border-medium)"}`,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {issue.severity}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Left accent line */}
                <div className="flex gap-3 items-start">
                  <div
                    className="w-1 rounded-full shrink-0 mt-1"
                    style={{
                      height: "40px",
                      background: severityColor[issue.severity] || "var(--saffron)",
                    }}
                  />
                  <div>
                    <h2
                      className="text-base font-semibold truncate"
                      style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
                    >
                      {issue.title}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      📍 {issue.location?.city || "Unknown City"}, {issue.location?.state || "Unknown State"}
                    </p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-xs px-2 py-1 rounded-md font-medium"
                    style={{
                      background: "var(--bg-elevated)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {issue.category}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: statusColor[issue.status] || "var(--text-muted)" }}
                  >
                    ● {issue.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
