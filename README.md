# 🏙️ AI-Powered Urban Issue Reporting and Resolution System

A full-stack civic grievance platform that enables citizens to report, track, and discuss urban issues while allowing administrators to manage and resolve reported problems efficiently.

## 📌 Overview

Issue Tracker is a web-based platform designed to connect citizens with local authorities. Users can report civic problems such as potholes, broken street lights, garbage, water leaks, electricity issues, and public safety concerns.

The platform provides issue categorization, severity levels, image uploads, location details, voting, comments, status tracking, an administrative dashboard, and an AI-powered help chatbot.

## ✨ Key Features

### 👤 User Features
- User Signup and Login
- Secure authentication using JWT
- Report civic issues
- Upload issue images
- Enter location details manually
- Select issue category and severity
- View reported issues
- Upvote / Downvote issues
- Add comments
- Track issue status
- User profile and reported issues

### 👨‍💼 Admin Features
- Admin authentication and dashboard
- View all registered users
- View and manage reported issues
- Update issue status:
  - Pending
  - Working
  - Done
- Filter issues by category, status, severity, city, and state
- Sort issues by severity
- Monitor issue statistics

### 🤖 AI Chatbot
- Seva Bot provides platform assistance
- Helps users understand how to report and track issues
- Provides troubleshooting guidance
- Powered through the Groq API

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- Axios
- CSS / Tailwind CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Joi Validation

### Database
- MongoDB Atlas
- Mongoose

### Cloud Services
- Cloudinary for image storage
- Groq API for AI chatbot

## 🔄 Application Workflow

1. User creates an account or logs in.
2. User reports a civic issue with title, description, category, severity, image, and location.
3. The image is uploaded to Cloudinary.
4. Issue information is stored in MongoDB.
5. Other users can view, vote, and comment on the issue.
6. Administrators monitor reported issues through the Admin Dashboard.
7. Admins update the issue status from Pending → Working → Done.
8. Users can track the updated status.

## 📂 Project Structure

```text
IssueTracker-main/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    ├── public/
    ├── index.html
    ├── package.json
    └── .env
