import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const severityColor = {
  Low:      "var(--teal-lt)",
  Medium:   "var(--gold-lt)",
  High:     "var(--saffron-lt)",
  Critical: "var(--crimson-lt)",
};
const statusColor = {
  Pending: "var(--status-pending)",
  Working: "var(--status-working)",
  Done:    "var(--status-done)",
};

const IssuesTable = ({ issues, refresh }) => {
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: "", status: "", city: "", state: "", severity: "", sort: "",
  });

  const uniqueCities  = [...new Set(issues.map((i) => i.location?.city).filter(Boolean))];
  const uniqueStates  = [...new Set(issues.map((i) => i.location?.state).filter(Boolean))];

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      await axios.delete(`${API_URL}/admin/issues/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      refresh();
    } catch (error) { console.error("Error deleting issue:", error); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/issues/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      refresh();
    } catch (error) { console.error("Error updating status:", error); }
  };

  const filteredIssues = useMemo(() => {
    let data = [...issues];
    if (filters.category) data = data.filter((i) => i.category  === filters.category);
    if (filters.status)   data = data.filter((i) => i.status    === filters.status);
    if (filters.city)     data = data.filter((i) => i.location?.city  === filters.city);
    if (filters.state)    data = data.filter((i) => i.location?.state === filters.state);
    if (filters.severity) data = data.filter((i) => i.severity  === filters.severity);
    if (filters.sort) {
      const order = ["Low","Medium","High","Critical"];
      data.sort((a, b) => {
        const diff = order.indexOf(a.severity) - order.indexOf(b.severity);
        return filters.sort === "high" ? -diff : diff;
      });
    }
    return data;
  }, [issues, filters]);

  const selectStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-medium)",
    color: "var(--text-secondary)",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "12px",
    outline: "none",
  };

  const thStyle = {
    padding: "10px 14px",
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    background: "var(--bg-elevated)",
    borderBottom: "1px solid var(--border-medium)",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "11px 14px",
    borderBottom: "1px solid var(--border-subtle)",
    fontSize: "13px",
    color: "var(--text-secondary)",
    verticalAlign: "middle",
  };

  return (
    <div>
      <h3
        className="text-lg font-bold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
      >
        Issues
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "category", opts: ["Road","Electricity","Water","Garbage","Public Safety","Other"] },
          { key: "status",   opts: ["Pending","Working","Done"] },
          { key: "severity", opts: ["Low","Medium","High","Critical"] },
        ].map(({ key, opts }) => (
          <select
            key={key}
            style={selectStyle}
            value={filters[key]}
            onChange={(e) => setFilters((p) => ({ ...p, [key]: e.target.value }))}
          >
            <option value="">{key.charAt(0).toUpperCase() + key.slice(1)}</option>
            {opts.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}

        <select style={selectStyle} value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}>
          <option value="">City</option>
          {uniqueCities.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select style={selectStyle} value={filters.state} onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}>
          <option value="">State</option>
          {uniqueStates.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select style={selectStyle} value={filters.sort} onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}>
          <option value="">Sort by Severity</option>
          <option value="high">High → Low</option>
          <option value="low">Low → High</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto admin-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead>
            <tr>
              {["Title","Status","Severity","Category","Location","Created By","Date","Action"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <tr
                  key={issue._id}
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td
                    style={{ ...tdStyle, cursor: "pointer", color: "var(--saffron-lt)", fontWeight: 500 }}
                    onClick={() => navigate(`/issue/${issue._id}`)}
                  >
                    {issue.title}
                  </td>

                  <td style={tdStyle}>
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                      style={{ ...selectStyle, fontSize: "11px" }}
                    >
                      <option>Pending</option>
                      <option>Working</option>
                      <option>Done</option>
                    </select>
                  </td>

                  <td style={{ ...tdStyle, color: severityColor[issue.severity] || "var(--text-secondary)", fontWeight: 600 }}>
                    {issue.severity}
                  </td>

                  <td style={tdStyle}>{issue.category}</td>

                  <td style={tdStyle}>
                    {issue.location ? (
                      <>
                        <div style={{ fontSize: "12px" }}>{issue.location.address}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {issue.location.city}, {issue.location.state}
                        </div>
                      </>
                    ) : "N/A"}
                  </td>

                  <td style={tdStyle}>{issue.user?.name || "Unknown"}</td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "12px" }}>
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(issue._id)}
                      className="text-xs font-semibold px-3 py-1 rounded-lg transition-opacity hover:opacity-80"
                      style={{ background: "var(--crimson-dim)", color: "var(--crimson-lt)", border: "1px solid var(--crimson)" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", padding: "28px" }}>
                  No issues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssuesTable;
