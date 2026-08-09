# 📞 Call Flow CRM - AI Call Assistant & Company Onboarding Portal

**Call Flow CRM** is an AI-powered Call & Lead Management CRM platform paired with a **Company Registration Portal**. 

---

## 🎯 Purpose of the Website & Platform

### 1. 🏢 Company Registration & ID Generation Portal
- **New Company Onboarding**: Companies visit the website to submit a registration request with their Company Name, Admin Contact, and Login credentials.
- **Admin Review & Approval**: Platform admins inspect incoming registration requests.
- **Automatic Company ID Assignment**: Upon approval, the platform automatically generates a unique **Company ID** (e.g. `CALL-240001`).
- **Secure Company Login**: Approved company admins sign into their dedicated CRM workspace using their Company ID / Login ID.

### 2. 📱 Sales Lead & AI Call Management Workspace
- **Lead Dashboard**: Real-time status breakdown (New, Warm, Proposal, Closed), lead scoring, and activity feeds.
- **Native Phone & SMS Integration**: Launch native phone dialers (`tel:`) and SMS apps (`sms:`) directly from lead cards without paid telecom API fees.
- **AI Note & Call Summarizer**: Instant 2-line AI call summaries, key topic detection, outcome classification, and suggested follow-up SMS messages (supports Ollama local AI with built-in zero-dependency fallback).
- **Follow-up Automation**: Smart scheduling for callback reminders and pipeline status transitions.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Vanilla CSS with Glassmorphism, Lenis smooth scrolling
- **Backend API**: Node.js, Express, JWT Authentication, bcrypt password hashing
- **Storage**: Persistent store (`server/data/db.json`) with serverless `/tmp` fallback
- **Deployment**: Vercel Serverless Monorepo ready (`vercel.json`)

---

## 🚀 Quick Start (Run Locally)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start the Backend API (Terminal 1)
```bash
npm run dev:server
```
*Backend runs on http://localhost:4000*

### 3. Start the Frontend Website (Terminal 2)
```bash
npm run dev:client
```
*Website runs on http://localhost:5173*

---

## 🔑 Demo Seed Credentials

You can test the platform immediately using the default seed account:

- **Login / Company ID**: `CALL-240001` or `admin`
- **Password**: `demo123`
- **Role**: Platform & Company Admin

---

## 🌐 1-Click Vercel Deployment

This project includes a root `vercel.json` for zero-configuration Vercel deployment:

1. Push this codebase to your **GitHub** repository.
2. Import the repository into **[Vercel](https://vercel.com)**.
3. Click **Deploy** — Vercel will automatically build the React frontend and deploy the Express API serverless functions!

See [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md) for full deployment details.