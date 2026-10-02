<div align="center">

  <svg viewBox="0 0 64 64" width="80" height="80">
    <defs>
      <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d6ff73" />
        <stop offset="100%" stopColor="#8de31a" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="52" height="52" rx="18" fill="#111111" />
    <path d="M21 24.5c3.2-5.6 7.8-8.4 14-8.4 4.5 0 8 1.2 10.7 3.5l-3.7 4.3c-1.8-1.4-4-2.1-6.5-2.1-3.7 0-6.7 1.6-8.8 4.7-1.1 1.6-1.8 3.2-2.1 4.8h13.5v5.9H24.7c.4 1.8 1.2 3.5 2.4 5.1 2.2 2.9 5.1 4.4 8.8 4.4 2.8 0 5.2-.8 7.3-2.5l3.6 4.2c-3.1 2.8-6.9 4.2-11.4 4.2-6.3 0-11.2-2.6-14.7-7.9-1.6-2.4-2.7-4.9-3.1-7.6h-4.2v-5.9h3.9c.6-2.6 1.5-5.1 2.8-7.3Z" fill="url(#brandGlow)" />
    <path d="M33 20.5h14.5v5.5H39v5.7h7.8v5.3H39V48h-6V20.5Z" fill="#ffffff" opacity="0.96" />
  </svg>

  # CRM-Website: Call Flow CRM Portal

  **Full-stack AI Call CRM & Company Registration Portal built with React, Vite, Node.js, Express, and Vercel serverless deployment. Features company onboarding, automated Company ID generation, sales lead management, and AI call summarization.**

  [Repository](https://github.com/bhaveshpatil-ks/CRM-Website) • [Live Demo](#quick-start-run-locally) • [Architecture](#component--architectural-breakdown) • [Deployment](#1-click-vercel-deployment)

  <br />

  [![React](https://img.shields.io/badge/REACT_18-090D16?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/VITE_5-090D16?style=for-the-badge&logo=vite&logoColor=646CFF)](https://vitejs.dev/)
  [![Node.js](https://img.shields.io/badge/NODE.JS_EXPRESS-090D16?style=for-the-badge&logo=nodedotjs&logoColor=339933)](https://nodejs.org/)
  [![Vercel](https://img.shields.io/badge/VERCEL_SERVERLESS-090D16?style=for-the-badge&logo=vercel&logoColor=FFFFFF)](https://vercel.com/)
  [![License: MIT](https://img.shields.io/badge/LICENSE-MIT-10b981?style=for-the-badge)](LICENSE)

</div>

---

## 🌐 Overview & Purpose of the Website

**CRM-Website** serves as the public-facing marketing, enterprise onboarding, and governance portal for the AI Call CRM ecosystem. It connects business organizations with the underlying mobile call intelligence engine.

### Core Work of the Website:
1. **Public Brand Landing & Above-the-Fold Value Delivery**:
   Articulates clearly to arriving executives what the platform is, who it is built for, why it saves thousands in software and telephony fees, and what action to take next.
2. **Automated Company Onboarding & ID Generation**:
   Enables companies, sales agencies, and enterprise teams to submit registration requests. Upon platform admin review, the system automatically provisions sequential Company IDs (e.g. `CALL-240001`).
3. **Platform Administration & Approval Governance**:
   Equips platform administrators with a dedicated inspection board (`/admin`) to approve or reject pending company registrations, inspect contact profiles, and issue workspace access credentials.
4. **Dedicated Company Admin Portal**:
   Provides approved company leadership with a private workspace to track account status, security tokens, team member counts, and CRM synchronization settings.
5. **Interactive Sales Lead & AI Call Showcase**:
   Features an end-to-end interactive simulation of the AI Call CRM engine—allowing prospective clients to test live call summarization, sentiment extraction, and 1-tap SMS follow-ups in real time.
6. **Vercel Serverless Architecture**:
   Structured for serverless monorepo deployment with instant edge loading, zero server maintenance, and automatic API routing.

---

## 🏛️ Above-The-Fold 4 Pillars Architecture

At the very top of the landing experience, the website presents four high-contrast telemetry cells:

| Pillar | Focus | Implementation & Description |
| :--- | :--- | :--- |
| **01 // WHAT IT IS** | Core Product | Automatic AI call recording summarizer, transcription engine & task checklist CRM. Turns any spoken conversation into structured notes in 2 seconds. |
| **02 // WHO IT IS FOR** | Universal Audience | **All types of users**: Sales reps, business owners, freelancers, real estate brokers, consultants, field technicians, and individual professionals. |
| **03 // WHY IT MATTERS** | Value Proposition | Eliminates manual note-taking friction, remembers 100% of spoken commitments, and prepares ready-to-send follow-up SMS messages at $0 telecom fees. |
| **04 // WHAT TO DO NEXT** | Primary Action | Click **`Register Company`** below to provision your company workspace and receive your automated Company ID. |

---

## 👥 Built for All Types of Users

Whether you run a large sales team or work independently, the platform automatically creates actionable summaries for every call:

- **Sales Reps & Closers**: Captures prospect objections, agreed pricing, budget limits, and triggers 1-tap quote follow-ups.
- **Freelancers & Consultants**: Automatically logs client feedback, project scope adjustments, and deadline agreements so nothing is forgotten.
- **Real Estate Brokers**: Records buyer criteria, budget constraints, preferred localities, and scheduled site inspection dates.
- **Contractors & Field Engineers**: Extracts job site addresses, required parts, repair descriptions, and customer arrival windows.
- **Small Business Owners & Traders**: Summarizes wholesale supplier pricing, delivery schedules, and payment terms without taking paper notes.
- **Everyday Professionals**: Summarizes complex phone interviews, customer support disputes, and important personal service appointments.

---

## 🧩 Component & Architectural Breakdown

The frontend is engineered as a clean, single-page reactive application inside `client/src/App.jsx` with an architectural design system defined in `client/src/styles.css`:

### 1. `site-nav` (Sticky Architectural Header)
- **Visuals**: Translucent glass background with `backdrop-filter: blur(12px)` and 1px crisp architectural bottom border (`rgba(15, 23, 42, 0.09)`).
- **Navigation**: Numbered link routing (`01 Workflow`, `02 Architecture`, `03 Access`).
- **Brand Identity**: Monospace system identifier `[ SYS // CRM-2026 ]` paired with the vector SVG `BrandMark`.
- **Actions**: Direct buttons for `Company Sign In` and `Register Company`.

### 2. `HeroSection` & Telemetry Grid
- High-contrast typography powered by **Inter** and **JetBrains Mono**.
- Real-time telemetry indicators: `Engine: Online`, `Processing: ~0.4s`, `Security: Encrypted`.
- Interactive primary CTA with 3D tactile offset shadow and secondary action buttons.

### 3. `arch-hero-pillars` (4 Pillars Grid)
- Monospace architectural micro-tags (`[ 01 // WHAT_IT_IS ]`, `[ 02 // TARGET_AUDIENCE ]`, `[ 03 // VALUE_PROP ]`, `[ 04 // ACTION_TRIGGER ]`).
- High-contrast `#090d16` headlines and concise explanations.
- Action button inside the 4th cell that directly triggers the company registration modal.

### 4. `arch-terminal` (Interactive Terminal Specimen)
- Live monospace simulation of the post-call AI ingestion pipeline:
  - `01 CALL_DETECTED` (Audio stream captured from carrier).
  - `02 WHISPER_TRANSCRIBE` (Multi-speaker dialogue separated).
  - `03 AI_REASONING` (Action items & commercial sentiment extracted).
  - `04 CRM_DISPATCH` (Pipeline card created and 1-tap SMS prepared).

### 5. `CompanyRegistrationModal` (`access-modal`)
- Form collecting:
  - **Company Name** (e.g. `Apex Logistics Inc`)
  - **Admin Contact Name** (e.g. `Sarah Jenkins`)
  - **Company Email & Phone**
  - **Preferred Login Identifier & Password**
- Submits securely to `/api/companies/register` with validation feedback.
- Accessible backdrop blur with `Escape` key close listener and focus rings.

### 6. `AdminPortal` (`admin-shell`)
- Platform management interface for root administrators (`authMode === 'admin'`).
- Live count of Pending, Approved, and Rejected company applications.
- One-click **Approve** (assigns sequential Company ID) or **Reject** with status persistence.

### 7. `CompanyPortal` (`company-portal-shell`)
- Authenticated view for company administrators.
- Displays Company Name, assigned Company ID, approval state, and API integration token.

### 8. `PolicyModal`
- Dynamic slide-over modal rendering full legally compliant **Terms of Service** and **Privacy Policy** documents.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, JavaScript (ES2022) |
| **Typography** | `Inter` (sans-serif) & `JetBrains Mono` (code & telemetry) |
| **Styling** | Native CSS3 Variables, Glassmorphism, 8px modular spacing scale |
| **Animation & Physics** | `@studio-freight/lenis` momentum smooth scrolling |
| **Backend API** | Node.js, Express 4, CORS, JSON Body Parser |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Database** | Persistent JSON store (`server/data/db.json`) with `/tmp` serverless fallback |
| **Deployment** | Vercel Serverless monorepo (`vercel.json`) |

---

## 📂 Project Directory Structure

```text
CRM-Website/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI build & verification workflow
├── client/                      # React 18 + Vite Frontend
│   ├── public/                  # Static assets & brand icons
│   ├── src/
│   │   ├── api.js               # Centralized client for Auth, Leads, Companies, AI
│   │   ├── App.jsx              # Main website application & portal component
│   │   ├── main.jsx             # React DOM root entry point
│   │   └── styles.css           # Minimal architectural CSS design system
│   ├── index.html               # HTML5 template with Inter & JetBrains Mono fonts
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite bundler configuration & local API proxy
├── server/                      # Node.js Express API Backend
│   ├── data/
│   │   └── db.json              # Local seed store (leads, companies, admin credentials)
│   ├── api.js                   # API route handlers & serverless export
│   ├── package.json             # Backend dependencies
│   └── server.js                # Standalone Express development server
├── vercel.json                  # Vercel serverless deployment routing config
├── DEPLOYMENT_VERCEL.md         # Step-by-step Vercel deployment guide
├── package.json                 # Monorepo root scripts (`install:all`, `dev:client`, `dev:server`)
└── README.md                    # Website architecture & component documentation
```

---

## 🚀 Quick Start (Run Locally)

### 1. Clone the Repository
```bash
git clone https://github.com/bhaveshpatil-ks/CRM-Website.git
cd CRM-Website
```

### 2. Install All Dependencies
```bash
npm run install:all
```

### 3. Start Backend API Server
```bash
npm run dev:server
```
*API server runs locally at: `http://localhost:4000`*

### 4. Start Frontend Website (New Terminal)
```bash
npm run dev:client
```
*Website runs locally at: `http://localhost:5173`*

---

## 🔑 Demo & Test Credentials

You can test the platform immediately using the default credentials:

| Role | Login Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin` | `demo123` | Full access to `/admin` approval board & company management |
| **Registered Company** | `CALL-240001` | `demo123` | Company portal, lead management, and AI call summary suite |

---

## 🌐 1-Click Vercel Deployment

This repository includes a root `vercel.json` optimized for instant Vercel deployment:

1. Push your changes to [https://github.com/bhaveshpatil-ks/CRM-Website](https://github.com/bhaveshpatil-ks/CRM-Website).
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import `bhaveshpatil-ks/CRM-Website`.
4. Leave build settings default (Vercel automatically detects `vercel.json`).
5. Click **Deploy** — both the React frontend and serverless API endpoints deploy in seconds.

---

## 🔗 Related Repositories

- **Mobile Application**: [bhaveshpatil-ks/CRM_APP](https://github.com/bhaveshpatil-ks/CRM_APP) — Mobile AI CRM that auto-syncs phone call recordings, generates AI summaries, and manages lead pipelines.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).