import React, { useEffect, useState } from "react";
import axios from "axios";
import UsersTable from "./UsersTable";
import IssuesTable from "./IssueTable";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

/* Indian palette for charts */
const CHART_COLORS = ["#E8B800", "#00A896", "#E8650A"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users,  setUsers]  = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats,  setStats]  = useState({ totalUsers: 0, totalIssues: 0, pending: 0, working: 0, done: 0 });
  const token = localStorage.getItem("token");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [userRes, issueRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`,  { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/issues`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUsers(userRes.data.users);
      setIssues(issueRes.data.issues);
      const pending = issueRes.data.issues.filter((i) => i.status === "Pending").length;
      const working = issueRes.data.issues.filter((i) => i.status === "Working").length;
      const done    = issueRes.data.issues.filter((i) => i.status === "Done").length;
      setStats({ totalUsers: userRes.data.users.length, totalIssues: issueRes.data.issues.length, pending, working, done });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Working", value: stats.working },
    { name: "Done",    value: stats.done    },
  ];

  const statCards = [
    { emoji: "👤", label: "Users",   value: stats.totalUsers,  color: "var(--saffron-lt)",  dim: "var(--saffron-dim)" },
    { emoji: "📋", label: "Issues",  value: stats.totalIssues, color: "var(--teal-lt)",     dim: "var(--teal-dim)"    },
    { emoji: "⏳", label: "Pending", value: stats.pending,     color: "var(--gold-lt)",     dim: "var(--gold-dim)"    },
    { emoji: "⚙️", label: "Working", value: stats.working,     color: "var(--saffron-lt)",  dim: "var(--saffron-dim)" },
    { emoji: "✅", label: "Done",    value: stats.done,        color: "var(--status-done)", dim: "rgba(26,122,58,0.18)" },
  ];

  const cardBase = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-medium)",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <div
      className="min-h-screen px-6 pt-24 pb-12"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Heading */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
        >
          🧭 Admin Dashboard
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          प्रशासन पैनल — Administrative Control Panel
        </p>
        <div className="kolam-divider w-32 mx-auto mt-3" />
      </div>

      {/* ── Stat cards ── */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-10">
        {statCards.map(({ emoji, label, value, color, dim }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center relative overflow-hidden"
            style={cardBase}
          >
            {/* left accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ background: color }}
            />
            <div className="text-2xl mb-1">{emoji}</div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)", color }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Pie */}
        <div className="rounded-xl p-5" style={cardBase}>
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
          >
            Issue Distribution
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", borderRadius: 8, color: "var(--text-primary)" }}
              />
              <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div className="rounded-xl p-5" style={cardBase}>
          <h3
            className="text-base font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--saffron-lt)" }}
          >
            Issue Status Trends
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={pieData}>
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-medium)", borderRadius: 8, color: "var(--text-primary)" }}
              />
              <Bar dataKey="value" fill="var(--saffron)" barSize={36} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex justify-center gap-4 mb-6">
        {["users", "issues"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg font-semibold text-sm capitalize transition-all"
            style={
              activeTab === tab
                ? { background: "var(--saffron)", color: "#FFF5E8", boxShadow: "var(--shadow-glow-saffron)" }
                : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-medium)" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tables ── */}
      <div className="rounded-xl overflow-hidden p-5" style={cardBase}>
        {activeTab === "users"
          ? <UsersTable  users={users}   refresh={fetchData} />
          : <IssuesTable issues={issues} refresh={fetchData} />
        }
      </div>
    </div>
  );
};

export default AdminDashboard;
