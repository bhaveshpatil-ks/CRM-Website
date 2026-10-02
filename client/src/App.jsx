import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { api, clearSession } from "./api";

const formatDate = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

const toDatetimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 16);
};

const addDaysToLocalInput = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(11, 0, 0, 0);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 16);
};

const statusTone = {
  New: "tone-new",
  Warm: "tone-warm",
  Proposal: "tone-proposal",
  Closed: "tone-closed"
};

const policyContent = {
  terms: {
    label: "Terms & Conditions",
    title: "Terms for using Call Flow CRM",
    body: [
      "Call Flow CRM is designed for real company outreach work, including lead tracking, follow-up planning, and sales note management.",
      "Each workspace should be used only by authorized team members. Account sharing, misuse of customer information, or disruptive activity is not allowed.",
      "Teams are responsible for the notes, follow-ups, and records entered inside their workspace. Keep lead data accurate, respectful, and relevant to business operations."
    ]
  },
  privacy: {
    label: "Privacy Policy",
    title: "How Call Flow handles workspace data",
    body: [
      "Call Flow stores the information needed to run a calm and organized sales workflow, including lead details, notes, reminders, and account activity.",
      "Workspace data stays tied to the company account so teams can review conversations, next steps, and follow-up timing in one place.",
      "We aim to keep data use limited to product functionality, workspace continuity, and support needs rather than unnecessary collection."
    ]
  },
  cookies: {
    label: "Cookie Policy",
    title: "Session and browser storage details",
    body: [
      "Call Flow uses lightweight browser storage and session tools to support login continuity, smoother navigation, and consistent workspace behavior.",
      "These tools help the product remember active sessions and useful interface states without creating a noisy experience.",
      "The goal is product stability and convenience, not aggressive tracking behavior."
    ]
  },
  support: {
    label: "Support",
    title: "Help for rollout, access, and workflow questions",
    body: [
      "Support is meant to be direct, practical, and fast for teams using Call Flow in daily operations.",
      "If your workspace has login issues, missing context, or rollout questions, the support path should help your team get back on track quickly.",
      "Use the contact details below for product help, implementation guidance, or account-related questions."
    ]
  },
  contact: {
    label: "Contact",
    title: "Reach the Call Flow team",
    body: [
      "For product support, onboarding help, or account questions, email support@callflowcrm.com.",
      "For demos, partnerships, or business conversations, email hello@callflowcrm.com.",
      "We can also help teams that want a calmer sales workflow setup across follow-ups, notes, and reminders."
    ]
  }
};

const BrandMark = ({ compact = false }) => (
  <span className={`brand-mark ${compact ? "brand-mark-compact" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 64 64" role="presentation" focusable="false">
      <defs>
        <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d6ff73" />
          <stop offset="100%" stopColor="#8de31a" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="18" fill="#111111" />
      <path
        d="M21 24.5c3.2-5.6 7.8-8.4 14-8.4 4.5 0 8 1.2 10.7 3.5l-3.7 4.3c-1.8-1.4-4-2.1-6.5-2.1-3.7 0-6.7 1.6-8.8 4.7-1.1 1.6-1.8 3.2-2.1 4.8h13.5v5.9H24.7c.4 1.8 1.2 3.5 2.4 5.1 2.2 2.9 5.1 4.4 8.8 4.4 2.8 0 5.2-.8 7.3-2.5l3.6 4.2c-3.1 2.8-6.9 4.2-11.4 4.2-6.3 0-11.2-2.6-14.7-7.9-1.6-2.4-2.7-4.9-3.1-7.6h-4.2v-5.9h3.9c.6-2.6 1.5-5.1 2.8-7.3Z"
        fill="url(#brandGlow)"
      />
      <path
        d="M33 20.5h14.5v5.5H39v5.7h7.8v5.3H39V48h-6V20.5Z"
        fill="#ffffff"
        opacity="0.96"
      />
    </svg>
  </span>
);

const ActionIcon = ({ type }) => {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };

  if (type === "arrow-right") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    );
  }

  if (type === "check") {
    return (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (type === "admin") {
    return (
      <svg {...common}>
        <path d="M12 3 19 6v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    );
  }

  if (type === "download") {
    return (
      <svg {...common}>
        <path d="M12 3v11" />
        <path d="m8 10 4 4 4-4" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M14 4h5v16h-5" />
      <path d="M11 8 15 12l-4 4" />
      <path d="M15 12H4" />
    </svg>
  );
};
function App() {
  const menuRef = useRef(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("chooser");
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    identifier: "",
    password: ""
  });
  const [adminAuthForm, setAdminAuthForm] = useState({
    loginId: "",
    password: ""
  });
  const [registrationForm, setRegistrationForm] = useState({
    companyName: "",
    adminName: "",
    email: "",
    phone: "",
    loginId: "",
    password: "",
    notes: ""
  });
  const [dashboard, setDashboard] = useState(null);
  const [companyRequests, setCompanyRequests] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    source: ""
  });
  const [noteDraft, setNoteDraft] = useState("");
  const [interactionDraft, setInteractionDraft] = useState({
    type: "Call",
    summary: "",
    outcome: "Interested"
  });
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [summaryMeta, setSummaryMeta] = useState("");
  const [aiAssist, setAiAssist] = useState({
    outcome: "",
    nextStep: "",
    suggestedSms: "",
    recommendedStatus: "",
    followUpDays: null
  });
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [requestNotice, setRequestNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null);
  const [error, setError] = useState("");
  const lenisRef = useRef(null);

  const loadCompanyRequests = async () => {
    const requests = await api.getCompanyRequests();
    setCompanyRequests(requests);
  };

  useEffect(() => {
    lenisRef.current = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      smoothTouch: true,
      prevent: (node) => Boolean(
        node?.closest?.("[data-lenis-prevent], [data-lenis-prevent-wheel], [data-lenis-prevent-touch]")
      )
    });

    return () => {
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let finishTimer = 0;
    let pageReady = document.readyState === "complete";
    const startedAt = Date.now();
    const minimumScreenTime = 3200;

    const updateProgress = () => {
      const elapsed = Date.now() - startedAt;
      const target = pageReady
        ? Math.min(100, 94 + ((elapsed - minimumScreenTime) / 22))
        : Math.min(94, 8 + elapsed / 40);

      setBootProgress((current) => {
        if (target <= current) {
          return current;
        }

        return Math.min(target, 100);
      });

      if (pageReady && elapsed >= minimumScreenTime && target >= 100) {
        finishTimer = window.setTimeout(() => {
          setBootProgress(100);
          setIsBooting(false);
        }, 260);
        return;
      }

      animationFrame = window.requestAnimationFrame(updateProgress);
    };

    const handleReady = () => {
      pageReady = true;
    };

    window.addEventListener("load", handleReady);
    animationFrame = window.requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener("load", handleReady);
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(finishTimer);
    };
  }, []);

  const refreshList = async (nextId) => {
    const [dashboardData, leadList] = await Promise.all([api.getDashboard(), api.getLeads()]);
    setDashboard(dashboardData);
    setLeads(leadList);

    const targetId = nextId || selectedId || leadList[0]?.id || null;
    setSelectedId(targetId);
  };

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        if (cancelled) {
          return;
        }

        const { user: currentUser } = await api.getCurrentUser();
        if (cancelled) {
          return;
        }

        setUser(currentUser);
        if (currentUser.isPlatformAdmin) {
          await loadCompanyRequests();
          return;
        }

        setDashboard(null);
        setLeads([]);
        setSelectedLead(null);
        setSelectedId(null);
      } catch {
        clearSession();
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId || !user) {
      return;
    }

    api
      .getLead(selectedId)
      .then((lead) => {
        setSelectedLead(lead);
        setFollowUpDraft(toDatetimeLocal(lead.nextFollowUpAt));
      })
      .catch((err) => setError(err.message));
  }, [selectedId, user]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!user?.isPlatformAdmin) {
      setCompanyRequests([]);
      return;
    }

    loadCompanyRequests().catch((err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!accessModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccessModalOpen(false);
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [accessModalOpen]);

  useEffect(() => {
    if (!activePolicy) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActivePolicy(null);
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePolicy]);

  if (isBooting) {
    return (
      <div className="app-root">
        <div className="boot-screen">
          <div className="boot-screen-inner">
            <div className="boot-brand-lockup">
              <BrandMark />
              <div className="boot-copy">
                <span>Call Flow CRM</span>
                <strong>Preparing a calmer sales workspace</strong>
              </div>
            </div>

            <div className="boot-meter" aria-label="Loading progress">
              <div className="boot-meter-head">
                <strong>{Math.round(bootProgress)}%</strong>
              </div>
              <div className="boot-meter-track" aria-hidden="true">
                <span style={{ width: `${bootProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateLead = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const created = await api.createLead(newLead);
      setNewLead({
        name: "",
        company: "",
        phone: "",
        email: "",
        source: ""
      });
      await refreshList(created.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const result =
        authMode === "admin"
          ? await api.adminLogin(adminAuthForm)
          : await api.companyLogin(authForm);
      setUser(result.user);
      setAccessModalOpen(false);
      setAuthMode("chooser");
      setRequestNotice("");
      setSelectedLead(null);
      setSelectedId(null);
      setAuthForm({ identifier: "", password: "" });
      setAdminAuthForm({ loginId: "", password: "" });
      if (result.user.isPlatformAdmin) {
        await loadCompanyRequests();
        setDashboard(null);
        setLeads([]);
      }
      if (!result.user.isPlatformAdmin) {
        setDashboard(null);
        setLeads([]);
        setSelectedLead(null);
        setSelectedId(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterCompany = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const result = await api.registerCompany(registrationForm);
      setRequestNotice(
        `Request ${result.request.id} submitted. Your company can log in after admin approval.`
      );
      setRegistrationForm({
        companyName: "",
        adminName: "",
        email: "",
        phone: "",
        loginId: "",
        password: "",
        notes: ""
      });
      setAuthMode("submitted");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReviewCompanyRequest = async (requestId, action) => {
    setError("");

    try {
      await api.reviewCompanyRequest(requestId, { action });
      await loadCompanyRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const openAccessModal = (mode = "chooser", nextIdentifier = "") => {
    setError("");
    setRequestNotice("");
    setAuthMode(mode);
    if (mode === "admin") {
      setAdminAuthForm({
        loginId: nextIdentifier || "",
        password: ""
      });
    } else if (nextIdentifier) {
      setAuthForm((current) => ({ ...current, identifier: nextIdentifier }));
    }
    setAccessModalOpen(true);
  };

  const handleLogout = async () => {
    clearSession();
    setUser(null);
    setDashboard(null);
    setLeads([]);
    setSelectedId(null);
    setSelectedLead(null);
    setError("");
    setMenuOpen(false);
    setCompanyRequests([]);
  };

  const handleAddNote = async (event) => {
    event.preventDefault();

    if (!selectedLead || !noteDraft.trim()) {
      return;
    }

    try {
      await api.addNote(selectedLead.id, noteDraft.trim());
      setNoteDraft("");
      setSummaryMeta("");
      setAiAssist({
        outcome: "",
        nextStep: "",
        suggestedSms: "",
        recommendedStatus: "",
        followUpDays: null
      });
      const updated = await api.getLead(selectedLead.id);
      setSelectedLead(updated);
      await refreshList(selectedLead.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSummarizeNote = async () => {
    if (!noteDraft.trim()) {
      return;
    }

    setIsSummarizing(true);
    setError("");

    try {
      const result = await api.summarizeNote(noteDraft);
      setNoteDraft(result.summary);
      setSummaryMeta(`Summary generated with ${result.provider}.`);
      setAiAssist({
        outcome: result.outcome || "",
        nextStep: result.nextStep || "",
        suggestedSms: result.suggestedSms || "",
        recommendedStatus: result.recommendedStatus || "",
        followUpDays: typeof result.followUpDays === "number" ? result.followUpDays : null
      });
      setInteractionDraft((current) => ({
        ...current,
        outcome: result.outcome || current.outcome,
        summary: result.summary || current.summary
      }));

      if (typeof result.followUpDays === "number") {
        setFollowUpDraft(addDaysToLocalInput(result.followUpDays));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAddInteraction = async (event) => {
    event.preventDefault();

    if (!selectedLead || !interactionDraft.summary.trim()) {
      return;
    }

    try {
      await api.addInteraction(selectedLead.id, {
        type: interactionDraft.type,
        summary: interactionDraft.summary.trim(),
        direction: "Outbound",
        outcome: interactionDraft.type === "Call" ? interactionDraft.outcome : undefined
      });
      setInteractionDraft((current) => ({ ...current, summary: "", outcome: "Interested" }));
      const updated = await api.getLead(selectedLead.id);
      setSelectedLead(updated);
      setFollowUpDraft(toDatetimeLocal(updated.nextFollowUpAt));
      await refreshList(selectedLead.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUseSuggestedSms = () => {
    if (!aiAssist.suggestedSms) {
      return;
    }

    setInteractionDraft((current) => ({
      ...current,
      type: "SMS",
      summary: aiAssist.suggestedSms
    }));
  };

  const handleFollowUp = async (event) => {
    event.preventDefault();

    if (!selectedLead) {
      return;
    }

    try {
      await api.updateFollowUp(
        selectedLead.id,
        followUpDraft ? new Date(followUpDraft).toISOString() : null
      );
      const updated = await api.getLead(selectedLead.id);
      setSelectedLead(updated);
      await refreshList(selectedLead.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const dueLeadCount = leads.filter((lead) => {
    if (!lead.nextFollowUpAt) {
      return false;
    }

    return new Date(lead.nextFollowUpAt) <= new Date();
  }).length;

  const selectedLeadSummary = leads.find((lead) => lead.id === selectedId);
  const pendingCompanyRequests = companyRequests.filter((request) => request.status === "pending");
  const approvedCompanyRequests = companyRequests.filter((request) => request.status === "approved");
  const rejectedCompanyRequests = companyRequests.filter((request) => request.status === "rejected");
  const quickSmsHref =
    selectedLead && aiAssist.suggestedSms
      ? `sms:${selectedLead.phone}?body=${encodeURIComponent(aiAssist.suggestedSms)}`
      : selectedLead
        ? `sms:${selectedLead.phone}?body=${encodeURIComponent(
            `Hi ${selectedLead.name}, following up from ${selectedLead.company}.`
          )}`
        : null;

  if (!user) {
    return (
      <div className="app-root">
        <div className="auth-site">
          <header className={`site-nav ${mobileNavOpen ? "site-nav-open" : ""}`}>
            <div className="site-nav-inner">
              <div className="site-brand">
                <BrandMark />
                <div className="site-brand-text">
                  <span className="brand-sys-tag">SYS // CRM-2026</span>
                  <strong>Call Flow</strong>
                </div>
              </div>

              <nav className="site-links" aria-label="Primary">
                <a href="#how-it-works"><span className="link-num">01</span> Workflow</a>
                <a href="#features"><span className="link-num">02</span> Architecture</a>
                <a href="#contact"><span className="link-num">03</span> Access</a>
              </nav>

              <div className="site-nav-actions">
                <button type="button" className="nav-login-btn" onClick={() => openAccessModal("login")}>
                  Sign In
                </button>
                <button type="button" className="nav-cta-btn" onClick={() => openAccessModal("register")}>
                  <span>Register Company</span>
                  <span className="btn-arrow">&rarr;</span>
                </button>
              </div>

              {mobileNavOpen ? null : (
                <button
                  type="button"
                  className="mobile-nav-toggle"
                  aria-label="Open navigation menu"
                  aria-expanded={mobileNavOpen}
                  onClick={() => setMobileNavOpen(true)}
                >
                  <span />
                  <span />
                  <span />
                </button>
              )}
            </div>

            <div
              className={`mobile-nav-panel ${mobileNavOpen ? "mobile-nav-panel-open" : ""}`}
              aria-hidden={!mobileNavOpen}
            >
              <div className="mobile-nav-head">
                <span className="mobile-brand-tag">SYS // NAVIGATION</span>
                <button
                  type="button"
                  className="mobile-nav-close"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileNavOpen(false)}
                >
                  ✕
                </button>
              </div>

              <nav className="mobile-nav-links" aria-label="Mobile primary">
                <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>
                  01 / Workflow Pipeline
                </a>
                <a href="#features" onClick={() => setMobileNavOpen(false)}>
                  02 / Architecture &amp; Blueprints
                </a>
                <a href="#contact" onClick={() => setMobileNavOpen(false)}>
                  03 / Company Access &amp; Inquiries
                </a>
              </nav>

              <div className="mobile-nav-actions-stack">
                <button type="button" className="nav-cta-btn mobile-full-btn" onClick={() => { setMobileNavOpen(false); openAccessModal("register"); }}>
                  <span>Register Company &amp; Get ID</span>
                  <span className="btn-arrow">&rarr;</span>
                </button>
                <button type="button" className="nav-login-btn mobile-full-btn" onClick={() => { setMobileNavOpen(false); openAccessModal("login"); }}>
                  <span>Company Sign In</span>
                </button>
                <button type="button" className="mobile-admin-link" onClick={() => { setMobileNavOpen(false); openAccessModal("admin", "admin"); }}>
                  <ActionIcon type="admin" />
                  <span>Platform Admin Terminal</span>
                </button>
              </div>
            </div>
          </header>

          <main className="arch-main">
            {/* HERO SECTION: ARCHITECTURAL SPLIT LAYOUT */}
            <section className="arch-hero">
              <div className="arch-hero-container">
                <div className="arch-hero-left">
                  <div className="arch-badge">
                    <span className="arch-pulse-dot" aria-hidden="true" />
                    <span className="arch-badge-mono">SYS // AI CALL RECORDING CRM</span>
                  </div>

                  <h1 className="arch-title">
                    Instant AI call summaries for every conversation &amp; user.
                  </h1>

                  <p className="arch-lead">
                    Built for all types of users — sales reps, freelancers, consultants, real estate brokers, field technicians, and business owners. The second your phone call finishes, AI automatically transcribes the audio, generates an executive summary, and prepares an instant follow-up SMS.
                  </p>

                  {/* ABOVE-THE-FOLD 4-PILLAR ARCHITECTURAL SYSTEM */}
                  <div className="arch-hero-pillars">
                    <div className="arch-pillar-cell">
                      <span className="arch-pillar-label">WHAT IT IS</span>
                      <p className="arch-pillar-desc">Automatic AI call recording summarizer, transcription engine &amp; task checklist CRM.</p>
                    </div>
                    <div className="arch-pillar-cell">
                      <span className="arch-pillar-label">WHO IT IS FOR</span>
                      <p className="arch-pillar-desc">All types of users: Sales, freelancers, consultants, brokers, field teams &amp; businesses.</p>
                    </div>
                    <div className="arch-pillar-cell">
                      <span className="arch-pillar-label">WHY IT MATTERS</span>
                      <p className="arch-pillar-desc">Never write manual notes again. Get 2-second summaries and 1-tap client follow-ups.</p>
                    </div>
                  </div>

                  <div className="arch-cta-row">
                    <button
                      type="button"
                      className="arch-btn-primary"
                      onClick={() => openAccessModal("register")}
                    >
                      <span className="arch-btn-step">01</span>
                      <span className="arch-btn-text">Register Company &amp; Get ID</span>
                      <span className="arch-btn-arrow">&rarr;</span>
                    </button>

                    <button
                      type="button"
                      className="arch-btn-secondary"
                      onClick={() => openAccessModal("login")}
                    >
                      <span className="arch-btn-text">Company Sign In</span>
                    </button>
                  </div>

                  <div className="arch-utility-row">
                    <button
                      type="button"
                      className="arch-link-btn"
                      onClick={() => openAccessModal("admin", "admin")}
                    >
                      <span>Platform Admin Login</span>
                    </button>
                    <span className="arch-sep">/</span>
                    <button
                      type="button"
                      className="arch-link-btn"
                      onClick={() => openAccessModal("chooser")}
                    >
                      <span>Onboarding Guide &amp; App</span>
                    </button>
                  </div>

                  <div className="arch-telemetry-grid">
                    <div className="arch-telemetry-cell">
                      <span className="telemetry-label">WHAT TO DO NEXT</span>
                      <strong className="telemetry-value">REGISTER COMPANY</strong>
                      <span className="telemetry-desc">Get your CALL-ID in 60s &amp; deploy the app</span>
                    </div>
                    <div className="arch-telemetry-cell">
                      <span className="telemetry-label">TELECOM TAX</span>
                      <strong className="telemetry-value">$0.00 / FREE</strong>
                      <span className="telemetry-desc">Native device dialer &amp; carrier SIM</span>
                    </div>
                    <div className="arch-telemetry-cell">
                      <span className="telemetry-label">INTELLIGENCE</span>
                      <strong className="telemetry-value">AUTO-SYNC AI</strong>
                      <span className="telemetry-desc">Instant 2-line notes &amp; action checklist</span>
                    </div>
                  </div>
                </div>

                <div className="arch-hero-right">
                  <div className="arch-terminal">
                    <div className="terminal-header">
                      <div className="terminal-controls">
                        <span className="dot dot-red" />
                        <span className="dot dot-yellow" />
                        <span className="dot dot-green" />
                      </div>
                      <span className="terminal-title">SPECIMEN // ONBOARDING_FLOW_v2.0</span>
                      <span className="terminal-status">[ ACTIVE ]</span>
                    </div>

                    <div className="terminal-body">
                      <div className="terminal-step completed">
                        <div className="step-tag">PHASE 01: WEB REGISTRATION</div>
                        <div className="step-code">
                          <span className="code-key">company:</span> <span className="code-str">&quot;BluePeak Solar Systems&quot;</span><br />
                          <span className="code-key">admin:</span> <span className="code-str">&quot;Ananya Sharma&quot;</span><br />
                          <span className="code-key">login_id:</span> <span className="code-str">&quot;bluepeak&quot;</span>
                        </div>
                      </div>

                      <div className="terminal-connector">
                        <span className="connector-line" />
                        <span className="connector-badge">ADMIN APPROVED</span>
                      </div>

                      <div className="terminal-step highlighted">
                        <div className="step-tag">PHASE 02: ASSIGNED COMPANY IDENTIFIER</div>
                        <div className="company-id-specimen">
                          <span className="specimen-id-label">OFFICIAL COMPANY ID</span>
                          <strong className="specimen-id-value">CALL-240001</strong>
                          <span className="specimen-id-note">Permanent workspace key • Instant verification</span>
                        </div>
                      </div>

                      <div className="terminal-connector">
                        <span className="connector-line" />
                        <span className="connector-badge">WORKSPACE UNLOCKED</span>
                      </div>

                      <div className="terminal-step">
                        <div className="step-tag">PHASE 03: 1-TAP SALES OUTREACH &amp; AI</div>
                        <div className="live-action-strip">
                          <div className="action-pill"><span className="pill-dot green" /> Dialer: 1-Tap Ready</div>
                          <div className="action-pill"><span className="pill-dot blue" /> AI: Summary Generated</div>
                          <div className="action-pill"><span className="pill-dot amber" /> Callback: Due in 2d</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: 4-COLUMN ARCHITECTURAL PIPELINE MATRIX */}
            <section className="arch-pipeline-section" id="how-it-works">
              <div className="pipeline-header">
                <div className="pipeline-header-copy">
                  <span className="arch-section-tag">[ 01 // ARCHITECTURAL PIPELINE ]</span>
                  <h2 className="arch-section-title">The Four-Stage Company Lifecycle</h2>
                </div>
                <p className="pipeline-header-lead">
                  Engineered specifically so company onboarding stays organized on the web while sales outreach executes at maximum velocity in the CRM workspace.
                </p>
              </div>

              <div className="pipeline-grid">
                <div className="pipeline-col">
                  <span className="col-num">01</span>
                  <span className="col-category">REGISTRATION</span>
                  <h3 className="col-title">Submit Company Ticket</h3>
                  <p className="col-text">
                    Enter company name, administrator contact, and preferred login ID through the website form. No third-party API keys required.
                  </p>
                  <div className="col-status-bar">
                    <span className="status-label">STATUS</span>
                    <span className="status-val pending">QUEUE_PENDING</span>
                  </div>
                </div>

                <div className="pipeline-col">
                  <span className="col-num">02</span>
                  <span className="col-category">VERIFICATION</span>
                  <h3 className="col-title">Company ID Issued</h3>
                  <p className="col-text">
                    Platform admin reviews and approves the ticket. The system assigns your permanent Company ID (e.g. <code>CALL-240001</code>) for sign-in.
                  </p>
                  <div className="col-status-bar">
                    <span className="status-label">STATUS</span>
                    <span className="status-val verified">ID_PROVISIONED</span>
                  </div>
                </div>

                <div className="pipeline-col">
                  <span className="col-num">03</span>
                  <span className="col-category">OUTREACH</span>
                  <h3 className="col-title">1-Tap Direct Calling</h3>
                  <p className="col-text">
                    Reps click Call or SMS to instantly open device phone dialers via native protocols. Zero telecom per-minute gateway markup.
                  </p>
                  <div className="col-status-bar">
                    <span className="status-label">STATUS</span>
                    <span className="status-val active">DIRECT_CONNECT</span>
                  </div>
                </div>

                <div className="pipeline-col">
                  <span className="col-num">04</span>
                  <span className="col-category">SYNTHESIS</span>
                  <h3 className="col-title">AI Note Extraction</h3>
                  <p className="col-text">
                    Rough call notes turn into 2-line summaries, objection categorization, suggested follow-up SMS text, and scheduled callbacks.
                  </p>
                  <div className="col-status-bar">
                    <span className="status-label">STATUS</span>
                    <span className="status-val ai">AI_SYNTHESIZED</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: SYSTEM BLUEPRINTS */}
            <section className="arch-blueprints-section" id="features">
              <div className="blueprints-header">
                <span className="arch-section-tag">[ 02 // TECHNICAL BLUEPRINT ]</span>
                <h2 className="arch-section-title">Designed for Output, Not Admin Friction</h2>
              </div>

              <div className="blueprints-grid">
                <div className="blueprint-card">
                  <div className="blueprint-top">
                    <span className="bp-index">BP-01</span>
                    <span className="bp-tag">TELECOM ARCHITECTURE</span>
                  </div>
                  <h4>Zero-Cost Native Telecom Protocol</h4>
                  <p>
                    Traditional CRMs force you into paid Twilio integrations with ongoing monthly phone numbers and per-minute costs. Call Flow utilizes native <code>tel:</code> and <code>sms:</code> handlers to trigger real calls on any hardware instantly for $0.
                  </p>
                  <div className="bp-data-table">
                    <div className="bp-row">
                      <span>Traditional Telecom CRM</span>
                      <strong className="cost-bad">$0.04 - $0.12 / min</strong>
                    </div>
                    <div className="bp-row">
                      <span>Call Flow CRM Protocol</span>
                      <strong className="cost-good">$0.00 / FREE NATIVE</strong>
                    </div>
                  </div>
                </div>

                <div className="blueprint-card">
                  <div className="blueprint-top">
                    <span className="bp-index">BP-02</span>
                    <span className="bp-tag">AI PROCESSING</span>
                  </div>
                  <h4>Dual-Engine Note Synthesis</h4>
                  <p>
                    Write rough notes during the call. The engine extracts the customer outcome (Interested, Callback, Closed), formulates an immediate SMS response, and calculates the optimal callback date automatically.
                  </p>
                  <div className="bp-code-preview">
                    <div className="code-line"><span className="c-dim">// Input Note:</span> &quot;Spoke with VP. Send pricing tomorrow, loves the demo.&quot;</div>
                    <div className="code-line"><span className="c-green">&rarr; Outcome:</span> Interested | Follow-up: +1 Day</div>
                    <div className="code-line"><span className="c-green">&rarr; Suggested SMS:</span> &quot;Hi, thanks for the call. Sharing pricing details shortly.&quot;</div>
                  </div>
                </div>

                <div className="blueprint-card">
                  <div className="blueprint-top">
                    <span className="bp-index">BP-03</span>
                    <span className="bp-tag">DATA ISOLATION</span>
                  </div>
                  <h4>Guaranteed Workspace Segregation</h4>
                  <p>
                    Every approved company receives its own isolated data workspace. Leads, call recordings, notes, and activity feeds never leak across boundaries, while platform admins maintain clean global approval control.
                  </p>
                  <div className="bp-data-table">
                    <div className="bp-row">
                      <span>Access Verification</span>
                      <strong>Strict JWT Tokens</strong>
                    </div>
                    <div className="bp-row">
                      <span>Lead Isolation</span>
                      <strong>Per-Company Scoped</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: COMMAND BANNER CTA */}
            <section className="arch-command-section" id="contact">
              <div className="command-banner">
                <div className="command-banner-left">
                  <span className="command-tag">[ COMMAND // GET STARTED ]</span>
                  <h3>Register your company and claim your Company ID.</h3>
                  <p>Join front-desk and inside-sales teams operating a cleaner, calmer, and faster sales follow-up machine.</p>
                </div>
                <div className="command-banner-right">
                  <button type="button" className="arch-btn-primary banner-cta" onClick={() => openAccessModal("register")}>
                    <span className="arch-btn-step">01</span>
                    <span className="arch-btn-text">Register Company &amp; Get ID</span>
                    <span className="arch-btn-arrow">&rarr;</span>
                  </button>
                  <button type="button" className="arch-btn-secondary banner-cta" onClick={() => openAccessModal("login")}>
                    <span className="arch-btn-text">Sign In with Existing ID</span>
                  </button>
                </div>
              </div>
            </section>
          </main>

          {accessModalOpen ? (
            <div
              className="access-modal-backdrop"
              role="presentation"
              onClick={() => setAccessModalOpen(false)}
            >
              <div
                className={`access-modal access-modal-${authMode}`}
                data-lenis-prevent
                data-lenis-prevent-wheel
                data-lenis-prevent-touch
                role="dialog"
                aria-modal="true"
                aria-labelledby="access-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="access-modal-head">
                  <div>
                    <span>Company access</span>
                    <h3 id="access-modal-title">
                      {authMode === "chooser"
                        ? "Choose how your company enters Call Flow"
                        : authMode === "admin"
                          ? "Admin panel login"
                        : authMode === "login"
                          ? "Login to your approved company workspace"
                          : authMode === "register"
                            ? "Register your company for approval"
                            : "Registration request submitted"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="access-modal-close"
                    aria-label="Close company access window"
                    onClick={() => setAccessModalOpen(false)}
                  >
                    X
                  </button>
                </div>

                <div className={`access-modal-intro ${authMode === "chooser" ? "access-modal-intro-compact" : ""}`}>
                  {authMode === "chooser" ? (
                    <p>Select an option below. New companies must register first to receive an approved Company ID.</p>
                  ) : authMode === "admin" ? (
                    null
                  ) : authMode === "login" ? (
                    null
                  ) : authMode === "register" ? (
                    null
                  ) : (
                    <p>Your request is now waiting in the admin review queue. Once approved, the same credentials will unlock the workspace.</p>
                  )}
                </div>

                {authMode === "chooser" ? (
                  <div className="access-choice-grid">
                    <button type="button" className="access-choice-card access-choice-recommended" onClick={() => setAuthMode("register")}>
                      <div className="choice-badge-row">
                        <small>New Company</small>
                        <span className="badge-recommended">First-Time Setup</span>
                      </div>
                      <strong>Register Company</strong>
                      <span>Submit company details to receive your unique Company ID upon approval</span>
                      <em>Start Registration &rarr;</em>
                    </button>
                    <button type="button" className="access-choice-card" onClick={() => setAuthMode("login")}>
                      <div className="choice-badge-row">
                        <small>Approved Company</small>
                      </div>
                      <strong>Company Login</strong>
                      <span>Fast access using your approved Company ID or username</span>
                      <em>Continue to Sign In &rarr;</em>
                    </button>
                  </div>
                ) : null}

                {authMode === "login" ? (
                  <form className="access-form access-form-shell stack" onSubmit={handleAuthSubmit}>
                    {error ? <div className="access-inline-error">{error}</div> : null}
                    <div className="access-field">
                      <label htmlFor="company-identifier">Username / Company name</label>
                      <input
                        id="company-identifier"
                        required
                        autoComplete="username"
                        placeholder="admin or company name"
                        value={authForm.identifier}
                        onChange={(event) =>
                          setAuthForm((current) => ({ ...current, identifier: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="company-password">Password</label>
                      <input
                        id="company-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="Enter password"
                        value={authForm.password}
                        onChange={(event) =>
                          setAuthForm((current) => ({ ...current, password: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-form-actions">
                      <button type="button" className="secondary-button" onClick={() => setAuthMode("chooser")}>
                        Back
                      </button>
                      <button type="submit" className="primary-button">
                        Login
                      </button>
                    </div>
                  </form>
                ) : null}

                {authMode === "admin" ? (
                  <form className="access-form access-form-shell stack" onSubmit={handleAuthSubmit}>
                    {error ? <div className="access-inline-error">{error}</div> : null}
                    <div className="access-field">
                      <label htmlFor="admin-login-id">Admin ID</label>
                      <input
                        id="admin-login-id"
                        required
                        autoComplete="username"
                        placeholder="admin"
                        value={adminAuthForm.loginId}
                        onChange={(event) =>
                          setAdminAuthForm((current) => ({ ...current, loginId: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="admin-password">Password</label>
                      <input
                        id="admin-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="Enter password"
                        value={adminAuthForm.password}
                        onChange={(event) =>
                          setAdminAuthForm((current) => ({ ...current, password: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-form-actions">
                      <button type="button" className="secondary-button" onClick={() => setAuthMode("chooser")}>
                        Back
                      </button>
                      <button type="submit" className="primary-button">
                        Admin Login
                      </button>
                    </div>
                  </form>
                ) : null}

                {authMode === "register" ? (
                  <form className="access-form access-form-shell stack" onSubmit={handleRegisterCompany}>
                    {error ? <div className="access-inline-error">{error}</div> : null}
                    <div className="access-field">
                      <label htmlFor="register-company">Company name</label>
                      <input
                        id="register-company"
                        required
                        placeholder="Enter company name"
                        value={registrationForm.companyName}
                        onChange={(event) =>
                          setRegistrationForm((current) => ({
                            ...current,
                            companyName: event.target.value
                          }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="register-owner">Admin / owner name</label>
                      <input
                        id="register-owner"
                        required
                        placeholder="Enter owner name"
                        value={registrationForm.adminName}
                        onChange={(event) =>
                          setRegistrationForm((current) => ({ ...current, adminName: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="register-email">Work email</label>
                      <input
                        id="register-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={registrationForm.email}
                        onChange={(event) =>
                          setRegistrationForm((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="register-phone">Phone number</label>
                      <input
                        id="register-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+91"
                        value={registrationForm.phone}
                        onChange={(event) =>
                          setRegistrationForm((current) => ({ ...current, phone: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="register-login-id">Company username</label>
                      <input
                        id="register-login-id"
                        required
                        autoComplete="username"
                        placeholder="choose a username"
                        value={registrationForm.loginId}
                        onChange={(event) =>
                          setRegistrationForm((current) => ({ ...current, loginId: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="register-password">Set company password</label>
                      <input
                        id="register-password"
                        type="password"
                        required
                        minLength="6"
                        autoComplete="new-password"
                        placeholder="Create password"
                        value={registrationForm.password}
                        onChange={(event) =>
                          setRegistrationForm((current) => ({ ...current, password: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-field">
                      <label htmlFor="register-notes">Company details for admin review</label>
                      <textarea
                        id="register-notes"
                        rows="4"
                        placeholder="Optional note for approval"
                        value={registrationForm.notes}
                        onChange={(event) =>
                          setRegistrationForm((current) => ({ ...current, notes: event.target.value }))
                        }
                      />
                    </div>
                    <div className="access-form-actions">
                      <button type="button" className="secondary-button" onClick={() => setAuthMode("chooser")}>
                        Back
                      </button>
                      <button type="submit" className="primary-button">
                        Submit approval request
                      </button>
                    </div>
                  </form>
                ) : null}

                {authMode === "submitted" ? (
                  <div className="access-submitted">
                    <strong>Request sent to admin review</strong>
                    <p>{requestNotice}</p>
                    <button type="button" className="primary-button" onClick={() => setAuthMode("login")}>
                      Go to company login
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <footer className="site-footer">
            <div className="site-footer-brand-block">
              <div className="site-brand footer-brand">
                <BrandMark compact />
                <div>
                  <span>Call Flow CRM</span>
                  <strong>Built for faster follow-ups</strong>
                </div>
              </div>
              <p className="site-footer-tag">
                Calm workflow for call notes, next steps, and AI-assisted sales momentum.
              </p>
            </div>
            <div className="site-footer-links">
              <a href="#how-it-works">How it works</a>
              <a href="#features">Features</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="site-footer-copy">
              <p>Built for call notes, follow-up timing, and AI-assisted sales workflows.</p>
            </div>
            <div className="site-footer-mobile-meta">
              <div className="site-footer-legal">
                <button type="button" onClick={() => setActivePolicy("terms")}>Terms &amp; Conditions</button>
                <button type="button" onClick={() => setActivePolicy("privacy")}>Privacy Policy</button>
                <button type="button" onClick={() => setActivePolicy("cookies")}>Cookie Policy</button>
                <button type="button" onClick={() => setActivePolicy("support")}>Support</button>
                <button type="button" onClick={() => setActivePolicy("contact")}>Contact</button>
              </div>
              <p>(c) 2026 Call Flow CRM. All rights reserved.</p>
            </div>
          </footer>

          {activePolicy ? (
            <div
              className="policy-modal-backdrop"
              role="presentation"
              onClick={() => setActivePolicy(null)}
            >
              <div
                className="policy-modal"
                data-lenis-prevent
                data-lenis-prevent-wheel
                data-lenis-prevent-touch
                role="dialog"
                aria-modal="true"
                aria-labelledby="policy-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="policy-modal-head">
                  <div>
                    <span>{policyContent[activePolicy].label}</span>
                    <h3 id="policy-modal-title">{policyContent[activePolicy].title}</h3>
                  </div>
                  <button
                    type="button"
                    className="policy-modal-close"
                    aria-label="Close policy window"
                    onClick={() => setActivePolicy(null)}
                  >
                    X
                  </button>
                </div>

                <div className="policy-modal-body">
                  {policyContent[activePolicy].body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (user.isPlatformAdmin) {
    return (
      <div className="app-root">
        <div className="admin-shell">
          <header className="admin-topbar surface-card">
            <div className="admin-topbar-brand">
              <BrandMark compact />
              <div>
                <span>Platform admin</span>
                <strong>Company approval control</strong>
              </div>
            </div>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
          </header>

          {error ? <div className="banner error">{error}</div> : null}

          <section className="admin-hero surface-card">
            <div>
              <p className="eyebrow">Admin Panel</p>
              <h1>Review company tickets, control approvals, and keep access clean.</h1>
              <p className="hero-text">
                This panel is separate from the company workspace. Only approval flow and admin controls belong here.
              </p>
            </div>
            <div className="admin-hero-side">
              <article>
                <span>Pending</span>
                <strong>{pendingCompanyRequests.length}</strong>
              </article>
              <article>
                <span>Approved</span>
                <strong>{approvedCompanyRequests.length}</strong>
              </article>
              <article>
                <span>Rejected</span>
                <strong>{rejectedCompanyRequests.length}</strong>
              </article>
            </div>
          </section>

          <section className="surface-card approval-board">
            <div className="section-head">
              <div>
                <p className="eyebrow">Company approvals</p>
                <h2>Review new registration tickets</h2>
              </div>
              <span>{pendingCompanyRequests.length}</span>
            </div>

            <div className="approval-summary-strip">
              <article>
                <span>Pending</span>
                <strong>{pendingCompanyRequests.length}</strong>
              </article>
              <article>
                <span>Approved</span>
                <strong>{approvedCompanyRequests.length}</strong>
              </article>
              <article>
                <span>Rejected</span>
                <strong>{rejectedCompanyRequests.length}</strong>
              </article>
            </div>

            <div className="approval-list">
              {companyRequests.length ? (
                companyRequests.map((request) => (
                  <article className={`approval-card ${request.status}`} key={request.id}>
                    <div className="approval-card-head">
                      <div>
                        <strong>{request.companyName}</strong>
                        <p>
                          {request.adminName}{" - "}{request.loginId}
                        </p>
                      </div>
                      <span className={`status-pill mini ${request.status}`}>{request.status}</span>
                    </div>
                    <div className="approval-meta">
                      <span>{request.email}</span>
                      <span>{request.phone}</span>
                      <span>{formatDate(request.submittedAt)}</span>
                    </div>
                    {request.notes ? <p className="approval-notes">{request.notes}</p> : null}
                    {request.status === "pending" ? (
                      <div className="approval-actions">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => handleReviewCompanyRequest(request.id, "approved")}
                        >
                          Approve company
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleReviewCompanyRequest(request.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <p className="approval-review-state">
                        Reviewed by {request.reviewedBy || "admin"} on {formatDate(request.reviewedAt)}
                      </p>
                    )}
                  </article>
                ))
              ) : (
                <div className="empty-inline-state">
                  <strong>No company requests yet.</strong>
                  <p>New registration tickets will appear here for approval.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="company-portal-shell">
        <header className="company-portal-topbar surface-card">
          <div className="company-portal-brand">
            <BrandMark compact />
            <div>
              <span>Company access</span>
              <strong>{user.companyName || "Call Flow Company Portal"}</strong>
            </div>
          </div>
          <div className="company-portal-topbar-actions">
            <span className="company-portal-status">
              {user.approvalStatus === "approved" ? "Approved workspace" : user.approvalStatus || "Active"}
            </span>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {error ? <div className="banner error">{error}</div> : null}

        <section className="company-portal-hero surface-card">
          <div className="company-portal-copy">
            <p className="eyebrow">Website portal</p>
            <h1>Your company account is ready. Run the CRM inside the app, not on the website.</h1>
            <p className="company-portal-lead">
              This website should stay clean and simple. Use it for downloads, account details, rollout help,
              policies, and support while your actual CRM workflow lives inside the Call Flow app.
            </p>
            <div className="company-portal-actions">
              <a className="primary-button action-link" href="#company-downloads">
                Download app
              </a>
              <button type="button" className="secondary-button" onClick={() => setActivePolicy("support")}>
                Get support
              </button>
              <button type="button" className="secondary-button" onClick={() => setActivePolicy("contact")}>
                Contact team
              </button>
            </div>
            <div className="company-portal-mini-grid">
              <article>
                <span>Company login</span>
                <strong>{user.loginId || "Not assigned"}</strong>
              </article>
              <article>
                <span>Company ID</span>
                <strong>{user.appUserId || "Assigned after approval"}</strong>
              </article>
              <article>
                <span>Primary contact</span>
                <strong>{user.name || "Company admin"}</strong>
              </article>
            </div>
          </div>

          <div className="company-portal-hero-side">
            <div className="company-portal-side-card company-portal-side-highlight">
              <span>What belongs here</span>
              <strong>Website access, onboarding, downloads, and support</strong>
              <p>Keep this surface clean for company setup and guidance instead of day-to-day sales operations.</p>
            </div>
            <div className="company-portal-side-card">
              <span>What belongs in the app</span>
              <ul className="company-portal-bullet-list">
                <li>Lead tracking and pipeline work</li>
                <li>Call notes and AI summaries</li>
                <li>Follow-up timing and outreach actions</li>
              </ul>
            </div>
          </div>
        </section>

        <main className="company-portal-grid">
          <section className="company-portal-card surface-card" id="company-downloads">
            <div className="company-portal-card-head">
              <div>
                <p className="eyebrow">Downloads</p>
                <h2>Install Call Flow for your team</h2>
              </div>
            </div>
            <div className="company-download-grid">
              <article className="company-download-card">
                <span>Desktop app</span>
                <strong>Windows workspace app</strong>
                <p>Best for desk teams handling calls, notes, and follow-up routing every day.</p>
                <button type="button" className="primary-button">Download for Windows</button>
              </article>
              <article className="company-download-card">
                <span>Mobile app</span>
                <strong>Android field access</strong>
                <p>For field teams, quick call outcomes, and mobile follow-up visibility on the go.</p>
                <button type="button" className="secondary-button">Get Android app</button>
              </article>
            </div>
          </section>

          <section className="company-portal-card surface-card">
            <div className="company-portal-card-head">
              <div>
                <p className="eyebrow">Account details</p>
                <h2>Company profile</h2>
              </div>
            </div>
            <div className="company-profile-grid">
              <div>
                <span>Company</span>
                <strong>{user.companyName || "Not available"}</strong>
              </div>
              <div>
                <span>Admin name</span>
                <strong>{user.name || "Not available"}</strong>
              </div>
              <div>
                <span>Work email</span>
                <strong>{user.email || "Not available"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{user.approvalStatus || "approved"}</strong>
              </div>
              <div>
                <span>Login username</span>
                <strong>{user.loginId || "Not available"}</strong>
              </div>
              <div>
                <span>Workspace ID</span>
                <strong>{user.appUserId || "Pending"}</strong>
              </div>
            </div>
          </section>

          <section className="company-portal-card surface-card">
            <div className="company-portal-card-head">
              <div>
                <p className="eyebrow">Getting started</p>
                <h2>Rollout checklist</h2>
              </div>
            </div>
            <div className="company-checklist">
              <article>
                <strong>1. Download the app</strong>
                <p>Install the desktop or mobile version your team will actually use for work.</p>
              </article>
              <article>
                <strong>2. Share company login</strong>
                <p>Use the approved company credentials only with the right team members.</p>
              </article>
              <article>
                <strong>3. Start CRM work in the app</strong>
                <p>Calls, notes, leads, AI actions, and reminders should happen inside the product app.</p>
              </article>
            </div>
          </section>

          <section className="company-portal-card surface-card">
            <div className="company-portal-card-head">
              <div>
                <p className="eyebrow">Help and policies</p>
                <h2>Need support or company info?</h2>
              </div>
            </div>
            <div className="company-policy-actions">
              <button type="button" className="secondary-button" onClick={() => setActivePolicy("terms")}>
                Terms &amp; Conditions
              </button>
              <button type="button" className="secondary-button" onClick={() => setActivePolicy("privacy")}>
                Privacy Policy
              </button>
              <button type="button" className="secondary-button" onClick={() => setActivePolicy("cookies")}>
                Cookie Policy
              </button>
              <button type="button" className="secondary-button" onClick={() => setActivePolicy("support")}>
                Support
              </button>
              <button type="button" className="secondary-button" onClick={() => setActivePolicy("contact")}>
                Contact
              </button>
            </div>
          </section>
        </main>
      </div>

      {activePolicy ? (
        <div
          className="policy-modal-backdrop"
          role="presentation"
          onClick={() => setActivePolicy(null)}
        >
          <div
            className="policy-modal"
            data-lenis-prevent
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="policy-modal-head">
              <div>
                <span>{policyContent[activePolicy].label}</span>
                <h3 id="policy-modal-title">{policyContent[activePolicy].title}</h3>
              </div>
              <button
                    type="button"
                    className="policy-modal-close"
                    aria-label="Close policy window"
                    onClick={() => setActivePolicy(null)}
                  >
                    X
                  </button>
            </div>

            <div className="policy-modal-body">
              {policyContent[activePolicy].body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
