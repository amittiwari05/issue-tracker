import React from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const UsersTable = ({ users, refresh }) => {
  const token = localStorage.getItem("token");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      refresh();
    } catch (error) { console.error("Error deleting user:", error); }
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
        Users
      </h3>

      <div className="overflow-x-auto admin-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
          <thead>
            <tr>
              {["Name","Email","Role","Joined","Action"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user._id}
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ ...tdStyle, color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.name}
                  </td>

                  <td style={tdStyle}>{user.email}</td>

                  <td style={tdStyle}>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-md"
                      style={
                        user.role === "admin"
                          ? { background: "var(--saffron-dim)", color: "var(--saffron-lt)", border: "1px solid rgba(232,101,10,0.3)" }
                          : { background: "var(--bg-card)",     color: "var(--text-muted)",  border: "1px solid var(--border-subtle)" }
                      }
                    >
                      {user.role}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, color: "var(--text-muted)", fontSize: "12px" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(user._id)}
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
                <td colSpan="5" style={{ ...tdStyle, textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", padding: "28px" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
