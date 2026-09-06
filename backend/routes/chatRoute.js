const express = require("express");
const router = express.Router();
const axios = require("axios");

// ── Rate limiter ────────────────────────────────────────────────
const rateLimitMap = new Map();

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return next();
  }

  const r = rateLimitMap.get(ip);

  if (now - r.start > 60000) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return next();
  }

  if (r.count >= 30) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please wait a moment.",
    });
  }

  r.count++;
  next();
};

setInterval(() => {
  const now = Date.now();

  for (const [ip, r] of rateLimitMap.entries()) {
    if (now - r.start > 60000) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

// ── System prompt ───────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Seva Bot 🪔, the friendly help assistant for "Issue Tracker" — a civic grievance platform built for Indian citizens (also called TrackSeva / नागरिक मंच).

Your job is to help users understand and use the platform. Be warm, helpful, concise, and occasionally use simple Hindi phrases naturally (like "ji", "bilkul", "shukriya"). Keep answers short — 2-4 sentences max unless the user asks for detail.

ABOUT THE PLATFORM:
- Issue Tracker lets Indian citizens report civic problems: potholes, broken streetlights, water leaks, garbage, electricity issues, public safety concerns.
- Users can report issues with photos, location, category (Road/Electricity/Water/Garbage/Public Safety/Other), and severity (Low/Medium/High/Critical).
- Every issue gets a status: Pending → Working → Done.
- Users can upvote/downvote issues and leave comments.
- Admins (local authorities) can update issue status and respond with official comments.
- The dashboard shows all reported issues with filters for city, state, category, severity.

HOW TO USE:
- Signup/Login: Create a free account at /signup or login at /login.
- Report an issue: Go to "Post" in the navbar after logging in. Fill title, description, pick category & severity, upload a photo, and enter your location manually.
- Browse issues: Click "Issues" in the navbar — no login needed.
- View an issue: Click any card to see full details, vote, and comment.
- Profile: See all your reported issues and logout from /profile.
- Admin panel: Only visible to admin users — manage all issues and users, view charts.

CONTACTING AUTHORITIES:
- Authorities (admins) monitor the dashboard and respond via official comments (shown in teal/green).
- High-severity and highly-upvoted issues get priority attention.
- There is no direct messaging — all communication happens through issue comments.
- For emergencies: dial 112 (Police/Ambulance/Fire), 1916 (water/electricity complaints in many states), or your local municipal helpline.

TROUBLESHOOTING:
- "Can't post issue" → You need to be logged in first. Go to /login.
- "Location not detected" → Enter your address, city, state, and country manually while reporting the issue.
- "Photo not uploading" → Check file size and make sure it is a valid image file.
- "Status not changing" → Only admins can change issue status.
- "Can't see my issue" → Check your profile page at /profile.

TONE:
Friendly, helpful, Indian civic spirit. End responses with an encouraging note sometimes. Never make up information not listed above. If unsure, say so honestly.`;

// ── POST /chat ──────────────────────────────────────────────────
router.post("/", rateLimit, async (req, res) => {
  try {
    const { messages } = req.body;

    // Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "messages array is required.",
      });
    }

    if (messages.length > 40) {
      return res.status(400).json({
        success: false,
        message: "Conversation too long. Please reset the chat.",
      });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({
          success: false,
          message: "Each message must have role and content.",
        });
      }

      if (!["user", "assistant"].includes(msg.role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message role.",
        });
      }

      if (typeof msg.content !== "string" || !msg.content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message content cannot be empty.",
        });
      }

      if (msg.content.length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Message too long (max 2000 chars).",
        });
      }
    }

    // ── Get Groq API Key ────────────────────────────────────────
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY missing from .env");

      return res.status(500).json({
        success: false,
        message:
          "Chat not configured. Please add GROQ_API_KEY to your .env file.",
      });
    }

    // ── Build messages for Groq ─────────────────────────────────
    const groqMessages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content.trim(),
      })),
    ];

    // ── Call Groq API ───────────────────────────────────────────
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        // Updated Groq model
        model: "openai/gpt-oss-20b",

        messages: groqMessages,

        max_tokens: 500,

        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },

        timeout: 30000,
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response. Please try again.";

    console.log("✅ Groq response received successfully");

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (err) {
    if (err.response) {
      console.error("❌ Groq API error status:", err.response.status);

      console.error(
        "❌ Groq API error body:",
        JSON.stringify(err.response.data)
      );

      if (err.response.status === 401) {
        console.error(
          "💡 Hint: GROQ_API_KEY is invalid. Get a new one from console.groq.com"
        );
      }

      if (err.response.status === 429) {
        console.error(
          "💡 Hint: Groq rate limit hit. Please try again later."
        );
      }

      if (err.response.status === 400) {
        console.error(
          "💡 Hint: Bad request sent to Groq. Check messages format and model name."
        );
      }

      return res.status(502).json({
        success: false,
        message:
          err.response.data?.error?.message ||
          "AI service error. Please try again.",
      });
    } else if (err.request) {
      console.error(
        "❌ No response from Groq — network error:",
        err.message
      );

      return res.status(502).json({
        success: false,
        message:
          "Could not reach AI service. Check your internet connection.",
      });
    } else {
      console.error("❌ Chat route error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again.",
      });
    }
  }
});

module.exports = router;