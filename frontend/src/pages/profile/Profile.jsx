import React, { useEffect, useState } from "react";
import axios from "axios";
import { handleError, handleSuccess } from "../../utils/utils";

const statusColor = {
  Done:    "var(--status-done)",
  Working: "var(--status-working)",
  Pending: "var(--status-pending)",
};

const Profile = () => {
  const [user,   setUser]   = useState(null);
  const [issues, setIssues] = useState([]);
  const token   = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setIssues(res.data.user.issuesReported || []);
      } catch (error) {
        handleError(error.response?.data?.message || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    handleSuccess("Logged out successfully! 👋");
    setTimeout(() => { window.location.href = "/login"; }, 1000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API_URL}/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleSuccess("Issue deleted!");
      setIssues(issues.filter((i) => i._id !== id));
    } catch {
      handleError("Failed to delete issue");
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="text-center" style={{ color: "var(--text-muted)" }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin mx-auto mb-3"
          style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
        Loading…
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen px-6 pt-24 pb-12"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="max-w-2xl mx-auto">

        {/* Page title */}
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
        >
          प्रोफ़ाइल / Profile
        </h2>

        {/* Profile card */}
        <div
          className="rounded-2xl p-5 flex items-center gap-5 mb-8 relative overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="tricolor-bar absolute top-0 left-0 right-0" />

          <img
            src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover shrink-0"
            style={{ border: "2px solid var(--saffron)" }}
          />

          <div className="flex-1">
            <p className="font-semibold text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              {user.name}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            <p
              className="text-xs mt-1 px-2 py-0.5 rounded-md inline-block font-semibold"
              style={{ background: "var(--saffron-dim)", color: "var(--saffron-lt)", border: "1px solid rgba(232,101,10,0.3)" }}
            >
              {user.role || "user"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 shrink-0"
            style={{ background: "var(--crimson-dim)", color: "var(--crimson-lt)", border: "1px solid var(--crimson)" }}
          >
            Logout
          </button>
        </div>

        {/* My Posts */}
        <h3
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)" }}
        >
          मेरी पोस्ट / My Posts ({issues.length})
        </h3>

        <div className="grid gap-4">
          {issues.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No issues posted yet.</p>
          ) : (
            issues.map((issue) => (
              <div
                key={issue._id}
                className="rounded-xl p-4 flex items-start justify-between gap-4"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold truncate"
                    style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
                  >
                    {issue.title}
                  </h4>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {issue.description}
                  </p>
                  <span
                    className="text-xs font-bold mt-2 inline-block"
                    style={{ color: statusColor[issue.status] || "var(--text-muted)" }}
                  >
                    ● {issue.status}
                  </span>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => (window.location.href = `/issue/${issue._id}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "var(--teal-dim)", color: "var(--teal-lt)", border: "1px solid var(--teal)" }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(issue._id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ background: "var(--crimson-dim)", color: "var(--crimson-lt)", border: "1px solid var(--crimson)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

