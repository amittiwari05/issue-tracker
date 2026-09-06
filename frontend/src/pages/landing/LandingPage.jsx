import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* ── tiny hook: animate a number counting up ── */
const useCountUp = (target, duration = 1800, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
};

/* ── Intersection observer hook ── */
const useInView = () => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

/* ── Stat card with count-up ── */
const StatCard = ({ value, suffix, label, color, delay, triggerCount }) => {
  const count = useCountUp(value, 1600, triggerCount);
  return (
    <div
      className="text-center px-6 py-8 rounded-2xl landing-fade-up"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-medium)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="text-5xl font-bold mb-2"
        style={{ fontFamily: "var(--font-display)", color }}
      >
        {count}{suffix}
      </div>
      <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
};

/* ── Feature card ── */
const FeatureCard = ({ icon, title, desc, accent, delay }) => (
  <div
    className="rounded-2xl p-6 group cursor-default landing-fade-up"
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-sm)",
      animationDelay: `${delay}ms`,
      transition: "box-shadow 0.25s, border-color 0.25s, transform 0.25s",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = accent;
      e.currentTarget.style.boxShadow   = `0 8px 28px ${accent}28`;
      e.currentTarget.style.transform   = "translateY(-3px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "var(--border-subtle)";
      e.currentTarget.style.boxShadow   = "var(--shadow-sm)";
      e.currentTarget.style.transform   = "translateY(0)";
    }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
      style={{ background: `${accent}18`, border: `1px solid ${accent}40` }}
    >
      {icon}
    </div>
    <h3
      className="text-lg font-bold mb-2"
      style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
    >
      {title}
    </h3>
    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
  </div>
);

/* ── Step in how-it-works ── */
const Step = ({ num, title, desc, accent, delay }) => (
  <div className="flex gap-5 landing-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
        style={{ background: accent, color: "var(--bg-base)", fontFamily: "var(--font-display)" }}
      >
        {num}
      </div>
      {num < 4 && <div className="w-0.5 flex-1 min-h-[32px] rounded-full" style={{ background: `${accent}30` }} />}
    </div>
    <div className="pb-6">
      <h4 className="font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
        {title}
      </h4>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════════
   MAIN LANDING PAGE
   ════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView();
  const [featRef,  featInView]  = useInView();
  const [howRef,   howInView]   = useInView();

  const SAFFRON  = "var(--saffron-lt)";
  const TEAL     = "var(--teal-lt)";
  const CRIMSON  = "var(--crimson-lt)";
  const GOLD     = "var(--gold-lt)";

  const features = [
    { icon: "📍", title: "Location-Aware Reports",     accent: "#E8650A", desc: "Auto-detects your GPS and reverse-geocodes your address. Every issue is pinned precisely on the map so authorities know exactly where to act." },
    { icon: "🗺️", title: "Live Map View",              accent: "#007C6E", desc: "Browse all reported issues plotted on an interactive Google Map. Filter by city, state, category or severity at a glance." },
    { icon: "🗳️", title: "Community Voting",           accent: "#C49A0A", desc: "Upvote or downvote issues to surface what matters most. Higher-voted issues get flagged to admins for priority attention." },
    { icon: "💬", title: "Threaded Comments",          accent: "#B52020", desc: "Citizens and admins can discuss issues in context. Admin responses are highlighted so official updates are never missed." },
    { icon: "📊", title: "Admin Analytics Dashboard", accent: "#6B2FA0", desc: "Visual bar and pie charts showing issue distribution, status trends, and city-level breakdowns — all in real time." },
    { icon: "🔔", title: "Status Tracking",            accent: "#007C6E", desc: "Every issue moves through Pending → Working → Done. Get a clear view of what's being fixed and what has been resolved." },
  ];

  const steps = [
    { num: 1, title: "Create your account",          accent: "#E8650A", desc: "Sign up in seconds with your name, email, and a profile picture. Your identity stays secure with JWT authentication." },
    { num: 2, title: "Spot an issue, report it",     accent: "#C49A0A", desc: "Take a photo, write a description, pick a category and severity. Your GPS location is attached automatically." },
    { num: 3, title: "Community rallies around it",  accent: "#007C6E", desc: "Other citizens see your report, vote on it, and add comments. The issue gains visibility based on community engagement." },
    { num: 4, title: "Authorities act on it",        accent: "#1A7A3A", desc: "Admins review high-priority issues, update the status, and post official responses. You see the resolution in real time." },
  ];

  const categories = [
    { label: "Roads",         icon: "🛣️",  color: "#E8650A" },
    { label: "Electricity",   icon: "⚡",  color: "#C49A0A" },
    { label: "Water Supply",  icon: "💧",  color: "#007C6E" },
    { label: "Garbage",       icon: "🗑️",  color: "#B52020" },
    { label: "Public Safety", icon: "🚨",  color: "#6B2FA0" },
    { label: "Other",         icon: "📌",  color: "#1A7A3A" },
  ];

  return (
    <div style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>

      {/* ══════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ paddingTop: "80px" }}
      >
        {/* Rangoli background rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[340, 560, 780, 1000].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size, height: size,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                border: `1px solid var(--border-subtle)`,
                opacity: 0.5 - i * 0.1,
              }}
            />
          ))}
          {/* Diagonal lattice */}
          <div className="rangoli-bg absolute inset-0 opacity-60" />
        </div>

        {/* Tricolor glow blobs */}
        <div className="absolute top-24 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,153,51,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-32 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(19,136,8,0.07) 0%, transparent 70%)" }} />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 landing-fade-up"
          style={{
            background: "var(--saffron-dim)",
            border: "1px solid var(--border-medium)",
            color: "var(--saffron-lt)",
            animationDelay: "0ms",
          }}
        >
          <span>🇮🇳</span> जन सेवा — Citizen Grievance Platform
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5 landing-fade-up"
          style={{ fontFamily: "var(--font-display)", animationDelay: "100ms", maxWidth: "780px" }}
        >
          Your voice.<br />
          <span style={{ color: "var(--saffron-lt)" }}>Your city.</span>{" "}
          <span style={{ color: "var(--teal-lt)" }}>Your right.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg max-w-xl mb-8 leading-relaxed landing-fade-up"
          style={{ color: "var(--text-secondary)", animationDelay: "200ms" }}
        >
          Report civic issues — potholes, broken streetlights, water leaks, garbage — 
          directly to your local authorities. Track progress. Build community. 
          Drive real change.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 landing-fade-up" style={{ animationDelay: "300ms" }}>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3.5 rounded-xl font-bold text-base"
            style={{
              background: "var(--saffron)",
              color: "var(--bg-base)",
              boxShadow: "var(--shadow-glow-saffron), 0 4px 14px rgba(0,0,0,0.15)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.3px",
              transition: "opacity 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Get Started — Free
          </button>
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3.5 rounded-xl font-bold text-base"
            style={{
              background: "transparent",
              color: "var(--text-primary)",
              border: "1.5px solid var(--border-strong)",
              fontFamily: "var(--font-display)",
              transition: "border-color 0.2s, color 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--saffron-lt)"; e.currentTarget.style.color = "var(--saffron-lt)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Browse Issues →
          </button>
        </div>

        {/* Scroll nudge */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 landing-fade-up"
          style={{ animationDelay: "600ms", color: "var(--text-muted)", fontSize: "11px" }}
        >
          <span>Scroll to explore</span>
          <div className="w-0.5 h-6 rounded-full" style={{ background: "var(--border-medium)", animation: "scrollBounce 1.6s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRICOLOR DIVIDER
          ══════════════════════════════════════ */}
      <div className="tricolor-bar" />

      {/* ══════════════════════════════════════
          STATS SECTION
          ══════════════════════════════════════ */}
      <section
        ref={statsRef}
        className="py-16 px-6"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={2400}  suffix="+"  label="Issues Reported"    color="var(--saffron-lt)" delay={0}   triggerCount={statsInView} />
          <StatCard value={98}    suffix="%"  label="Resolution Rate"    color="var(--teal-lt)"    delay={80}  triggerCount={statsInView} />
          <StatCard value={850}   suffix="+"  label="Active Citizens"    color="var(--gold-lt)"    delay={160} triggerCount={statsInView} />
          <StatCard value={120}   suffix="+"  label="Cities Covered"     color="var(--crimson-lt)" delay={240} triggerCount={statsInView} />
        </div>
      </section>

      <div className="kolam-divider mx-6 md:mx-auto md:max-w-4xl rounded-full my-2 opacity-60" />

      {/* ══════════════════════════════════════
          CATEGORIES STRIP
          ══════════════════════════════════════ */}
      <section className="py-10 px-6" style={{ background: "var(--bg-surface)" }}>
        <p className="text-center text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--text-muted)" }}>
          Issue Categories
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {categories.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: `${c.color}14`,
                border: `1px solid ${c.color}35`,
                color: c.color,
              }}
            >
              <span>{c.icon}</span> {c.label}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES SECTION
          ══════════════════════════════════════ */}
      <section
        ref={featRef}
        className="py-20 px-6"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--saffron-lt)" }}>
              Platform Features
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Everything you need to{" "}
              <span style={{ color: "var(--saffron-lt)" }}>make a difference</span>
            </h2>
            <div className="kolam-divider w-24 mx-auto mt-4" />
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            style={{ opacity: featInView ? 1 : 0, transition: "opacity 0.4s" }}
          >
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════ */}
      <section
        ref={howRef}
        className="py-20 px-6"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Left: text */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--teal-lt)" }}>
              How it works
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              From problem{" "}
              <span style={{ color: "var(--teal-lt)" }}>to resolution</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
              Our platform creates a transparent chain of accountability — 
              from the moment a citizen spots an issue to the moment authorities 
              mark it resolved.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 rounded-xl font-bold text-sm"
              style={{
                background: "var(--teal)",
                color: "#FFF5E8",
                fontFamily: "var(--font-display)",
                boxShadow: "0 4px 14px rgba(0,124,110,0.3)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Join the movement →
            </button>
          </div>

          {/* Right: steps */}
          <div style={{ opacity: howInView ? 1 : 0, transition: "opacity 0.5s 0.2s" }}>
            {steps.map((s, i) => (
              <Step key={s.num} {...s} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MISSION SECTION
          ══════════════════════════════════════ */}
      <section
        className="py-20 px-6 relative overflow-hidden"
        style={{ background: "var(--bg-base)" }}
      >
        {/* decorative */}
        <div className="absolute inset-0 rangoli-bg opacity-40 pointer-events-none" />
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: "linear-gradient(to bottom, #FF9933, #FFFFFF, #138808)" }}
        />

        <div className="max-w-3xl mx-auto text-center relative">
          <span className="text-4xl mb-4 block">🕊️</span>
          <h2
            className="text-3xl md:text-4xl font-bold mb-5"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Built on the spirit of{" "}
            <span style={{ color: "var(--gold-lt)" }}>Jan Seva</span>
          </h2>
          <p className="text-base leading-relaxed mb-3" style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 12px" }}>
            Every pothole fixed, every streetlight repaired, every drain unclogged — 
            it starts with one citizen speaking up. This platform gives that voice 
            structure, visibility, and accountability.
          </p>
          <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            "जनता की समस्या, जनता की आवाज़" — The people's problem, the people's voice.
          </p>
          <div className="kolam-divider w-40 mx-auto mt-8" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════ */}
      <section
        className="py-20 px-6 relative overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <div
          className="max-w-2xl mx-auto text-center rounded-3xl px-8 py-14 relative overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Tricolor top accent */}
          <div className="tricolor-bar absolute top-0 left-0 right-0 rounded-t-3xl" />

          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Ready to make your city better?
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-muted)", maxWidth: "440px", margin: "0 auto 28px" }}>
            Join thousands of citizens already using Issue Tracker to hold 
            local authorities accountable and build stronger communities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3.5 rounded-xl font-bold text-base"
              style={{
                background: "var(--saffron)",
                color: "var(--bg-base)",
                fontFamily: "var(--font-display)",
                boxShadow: "var(--shadow-glow-saffron)",
                transition: "opacity 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Create Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 rounded-xl font-bold text-base"
              style={{
                background: "transparent",
                color: "var(--text-primary)",
                border: "1.5px solid var(--border-strong)",
                fontFamily: "var(--font-display)",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--saffron-lt)"; e.currentTarget.style.color = "var(--saffron-lt)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            >
              Already have an account? Login
            </button>
          </div>

          {/* trust line */}
          <p className="text-xs mt-8" style={{ color: "var(--text-muted)" }}>
            🔒 Free to use &nbsp;•&nbsp; No spam &nbsp;•&nbsp; Secure JWT auth &nbsp;•&nbsp; 🇮🇳 Made for Bharat
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
          ══════════════════════════════════════ */}
      <footer
        className="py-8 px-6 text-center"
        style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--saffron)" }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4"/>
              <circle cx="10" cy="10" r="2.2" fill="white"/>
              <line x1="10" y1="3" x2="10" y2="17" stroke="white" strokeWidth="1" opacity=".6"/>
              <line x1="3" y1="10" x2="17" y2="10" stroke="white" strokeWidth="1" opacity=".6"/>
            </svg>
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
            Issue Tracker
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>• ट्रैक सेवा</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Issue Tracker &nbsp;•&nbsp; नागरिक मंच &nbsp;•&nbsp; Built with ❤️ for India
        </p>
      </footer>

      {/* Page-level keyframes */}
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
          50%       { opacity: 0.9; transform: scaleY(1); }
        }
        .landing-fade-up {
          animation: landingFadeUp 0.55s ease both;
        }
        @keyframes landingFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
