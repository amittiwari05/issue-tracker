import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { handleError, handleSuccess } from "../../utils/utils";
import { jwtDecode } from "jwt-decode";

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL;

  const [issue,    setIssue]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [votes,    setVotes]    = useState({ upvotes: 0, downvotes: 0 });
  const [comment,  setComment]  = useState("");
  const [status,   setStatus]   = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try { setUserRole(jwtDecode(token).role || "user"); }
      catch { console.error("Invalid token"); }
    }
  }, []);

  const fetchIssue = async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.get(`${API_URL}/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssue(res.data.issue);
      setStatus(res.data.issue.status || "Pending");
      setVotes({ upvotes: res.data.issue.upvotes?.length || 0, downvotes: res.data.issue.downvotes?.length || 0 });
    } catch {
      handleError("Failed to load issue details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssue(); }, [id]);

  const handleVote = async (type) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.patch(`${API_URL}/issues/${id}/${type}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setVotes({ upvotes: res.data.upvotes, downvotes: res.data.downvotes });
      handleSuccess("Vote updated!");
    } catch { handleError("Error updating vote"); }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return handleError("Comment cannot be empty");
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.post(`${API_URL}/issues/${id}/comment`, { text: comment }, { headers: { Authorization: `Bearer ${token}` } });
      handleSuccess("Comment added!");
      setComment("");
      setIssue((prev) => ({ ...prev, comments: res.data.comments }));
    } catch { handleError("Failed to add comment"); }
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/issues/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      handleSuccess("Status updated!");
      fetchIssue();
    } catch { handleError("Failed to update status"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="text-center" style={{ color: "var(--text-muted)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
          style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
        Loading…
      </div>
    </div>
  );

  if (!issue) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-base)", color: "var(--crimson-lt)" }}>
      Issue not found.
    </div>
  );

  const adminComments = issue.comments?.filter((c) => c.user?.role === "admin") || [];
  const userComments  = issue.comments?.filter((c) => c.user?.role !== "admin")  || [];

  const statusColor = {
    Done:    "var(--status-done)",
    Working: "var(--status-working)",
    Pending: "var(--status-pending)",
  };

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-medium)",
    color: "var(--text-primary)",
  };

  return (
    <div
      className="min-h-screen px-4 pt-24 pb-16"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate("/home")}
          className="text-sm mb-6 inline-flex items-center gap-1 transition-colors hover:opacity-75"
          style={{ color: "var(--saffron-lt)" }}
        >
          ← वापस जाएं / Back to Issues
        </button>

        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Tricolor bar */}
          <div className="tricolor-bar" />

          <div className="p-7">
            {/* Title */}
            <h1
              className="text-3xl font-bold mb-2 leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
            >
              {issue.title}
            </h1>

            {/* Meta */}
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              Posted by{" "}
              <span style={{ color: "var(--saffron-lt)" }}>{issue.user?.name}</span>{" "}
              • {new Date(issue.createdAt).toLocaleDateString()}
            </p>

            {/* Status row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Status:</span>
              <span className="text-sm font-bold" style={{ color: statusColor[status] || "var(--text-muted)" }}>
                ● {status}
              </span>
              {status === "Done" && issue.resolvedAt && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  • Resolved {new Date(issue.resolvedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Admin status updater */}
            {userRole === "admin" && (
              <div className="flex gap-3 items-center mb-5">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                >
                  <option>Pending</option>
                  <option>Working</option>
                  <option>Done</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "var(--saffron)", color: "#FFF5E8" }}
                >
                  Update Status
                </button>
              </div>
            )}

            {/* Category + Severity */}
            <div className="flex gap-4 mb-5 flex-wrap">
              <span
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
              >
                📂 {issue.category || "N/A"}
              </span>
              <span
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "var(--crimson-dim)", color: "var(--crimson-lt)", border: "1px solid rgba(224,53,53,0.3)" }}
              >
                ⚠ {issue.severity || "N/A"}
              </span>
            </div>

            {/* Image */}
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-72 rounded-xl object-cover mb-5"
              style={{ border: "1px solid var(--border-subtle)" }}
            />

            {/* Description */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              {issue.description}
            </p>

            {/* Map */}
            {issue.location?.lat && (
              <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid var(--border-medium)" }}>
                <iframe
                  width="100%"
                  height="300"
                  loading="lazy"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${issue.location.lat},${issue.location.lng}`}
                />
              </div>
            )}

            {/* Kolam divider */}
            <div className="kolam-divider my-6" />

            {/* Votes */}
            <div className="flex justify-center gap-5 mb-7">
              <button
                onClick={() => handleVote("upvote")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-80"
                style={{ background: "var(--teal-dim)", color: "var(--teal-lt)", border: "1px solid var(--teal)" }}
              >
                👍 {votes.upvotes}
              </button>
              <button
                onClick={() => handleVote("downvote")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-80"
                style={{ background: "var(--crimson-dim)", color: "var(--crimson-lt)", border: "1px solid var(--crimson)" }}
              >
                👎 {votes.downvotes}
              </button>
            </div>

            {/* Comments */}
            <div>
              <h2
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
              >
                Comments
              </h2>

              {/* Add comment */}
              <div className="flex gap-3 mb-5">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment…"
                  className="grow rounded-lg px-4 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                  onFocus={e  => e.target.style.borderColor = "var(--saffron)"}
                  onBlur={e   => e.target.style.borderColor = "var(--border-medium)"}
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 rounded-lg font-semibold text-sm shrink-0 transition-opacity hover:opacity-80"
                  style={{ background: "var(--saffron)", color: "#FFF5E8" }}
                >
                  Post
                </button>
              </div>

              {/* Comment list */}
              <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                {[...adminComments, ...userComments].map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: c.user?.role === "admin" ? "var(--teal-dim)" : "var(--bg-elevated)",
                      border: `1px solid ${c.user?.role === "admin" ? "rgba(0,168,150,0.25)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: c.user?.role === "admin" ? "var(--teal-lt)" : "var(--saffron-lt)" }}
                      >
                        {c.user?.name || "Anonymous"}
                        {c.user?.role === "admin" && (
                          <span
                            className="ml-2 text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ background: "rgba(0,168,150,0.2)", color: "var(--teal-lt)" }}
                          >
                            Admin
                          </span>
                        )}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;

