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
                  <strong>Call Flow</strong>
                  <span>AI Call CRM</span>
                </div>
              </div>

              <nav className="site-links" aria-label="Primary">
                <a href="#how-it-works">How it works</a>
                <a href="#features">Features</a>
                <a href="#contact">Contact</a>
              </nav>

              <div className="site-nav-actions">
                <button type="button" className="nav-login-btn" onClick={() => openAccessModal("login")}>
                  Company Login
                </button>
                <button type="button" className="nav-cta-btn" onClick={() => openAccessModal("register")}>
                  <span>Register Company</span>
                  <ActionIcon type="arrow-right" />
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
                <button
                  type="button"
                  className="mobile-nav-close"
                  aria-label="Close navigation menu"
                  onClick={() => setMobileNavOpen(false)}
                >
                  X
                </button>
              </div>

              <nav className="mobile-nav-links" aria-label="Mobile primary">
                <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>
                  How it works
                </a>
                <a href="#features" onClick={() => setMobileNavOpen(false)}>
                  Features
                </a>
                <a href="#contact" onClick={() => setMobileNavOpen(false)}>
                  Contact
                </a>
              </nav>

              <div className="mobile-nav-actions-stack">
                <button type="button" className="nav-cta-btn" onClick={() => { setMobileNavOpen(false); openAccessModal("register"); }}>
                  <span>Register Company &amp; Get ID</span>
                  <ActionIcon type="arrow-right" />
                </button>
                <button type="button" className="nav-login-btn" onClick={() => { setMobileNavOpen(false); openAccessModal("login"); }}>
                  <span>Company Login</span>
                  <ActionIcon type="login" />
                </button>
                <button type="button" className="mobile-admin-link" onClick={() => { setMobileNavOpen(false); openAccessModal("admin", "admin"); }}>
                  <ActionIcon type="admin" />
                  <span>Admin Panel Login</span>
                </button>
              </div>
            </div>
          </header>

          <main>
            <section className="landing-hero">
              <div className="landing-hero-inner">
                <div className="landing-copy">
                  <div className="hero-kicker-badge">
                    <span className="kicker-pulse-dot" aria-hidden="true" />
                    <span>Company Onboarding Portal &amp; AI Call CRM</span>
                  </div>

                  <h1 className="hero-heading">
                    The AI Call &amp; Follow-Up CRM<br />
                    <span className="hero-heading-highlight">Built for Growing Companies.</span>
                  </h1>

                  <p className="hero-subheading">
                    Register your company to generate your unique Company ID. Equip your reps with automated call tracking, AI note summaries, and smart callbacks — without expensive telecom APIs.
                  </p>

                  <div className="hero-cta-cluster">
                    <button
                      type="button"
                      className="hero-primary-cta"
                      onClick={() => openAccessModal("register")}
                    >
                      <span className="cta-sparkle" aria-hidden="true">★</span>
                      <span>Register Company &amp; Get ID</span>
                      <ActionIcon type="arrow-right" />
                    </button>

                    <button
                      type="button"
                      className="hero-secondary-cta"
                      onClick={() => openAccessModal("login")}
                    >
                      <ActionIcon type="login" />
                      <span>Company Sign In</span>
                    </button>
                  </div>

                  <div className="hero-utility-row">
                    <button
                      type="button"
                      className="utility-btn"
                      onClick={() => openAccessModal("admin", "admin")}
                    >
                      <ActionIcon type="admin" />
                      <span>Platform Admin Panel</span>
                    </button>
                    <span className="utility-separator" aria-hidden="true">•</span>
                    <button
                      type="button"
                      className="utility-btn"
                      onClick={() => openAccessModal("chooser")}
                    >
                      <ActionIcon type="download" />
                      <span>Access &amp; Setup Guide</span>
                    </button>
                  </div>

                  <div className="hero-trust-strip">
                    <div className="trust-badge">
                      <span className="trust-check"><ActionIcon type="check" /></span>
                      <span>Instant Company ID on approval</span>
                    </div>
                    <div className="trust-badge">
                      <span className="trust-check"><ActionIcon type="check" /></span>
                      <span>Zero paid telecom API setup</span>
                    </div>
                    <div className="trust-badge">
                      <span className="trust-check"><ActionIcon type="check" /></span>
                      <span>Built-in local AI summarizer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-stats">
                <article>
                  <small className="stat-tag">Security &amp; Privacy</small>
                  <strong>100% Protected</strong>
                  <span>Each workspace maintains strict isolated lead history &amp; data privacy</span>
                </article>
                <article>
                  <small className="stat-tag">Outreach Velocity</small>
                  <strong>1-Tap Outreach</strong>
                  <span>Native phone dialer and SMS launch without costly API middlemen</span>
                </article>
                <article>
                  <small className="stat-tag">Automated Intelligence</small>
                  <strong>AI Summaries</strong>
                  <span>Turn rough sales notes into structured outcomes and next follow-up dates</span>
                </article>
              </div>
            </section>

            <section className="process-section" id="how-it-works">
              <div className="process-story">
                <span>How Call Flow works</span>
                <h3>Designed for front-desk, inside-sales, and fast-moving follow-up teams.</h3>
                <p>
                  The workflow keeps every outreach step visible while handling summaries, reminders, and
                  suggested next actions behind the scenes.
                </p>
              </div>

              <div className="process-list">
                <article>
                  <span>1</span>
                  <div>
                    <strong>Register &amp; Get Company ID</strong>
                    <p>Submit your company registration on the portal. Once reviewed by platform admin, your unique Company ID is assigned.</p>
                  </div>
                </article>
                <article>
                  <span>2</span>
                  <div>
                    <strong>Sign In &amp; Launch Workspace</strong>
                    <p>Enter your approved Company ID and password to access your team dashboard and start managing leads immediately.</p>
                  </div>
                </article>
                <article>
                  <span>3</span>
                  <div>
                    <strong>1-Tap Call &amp; SMS Outreach</strong>
                    <p>Click Call or SMS to instantly trigger your device dialer, record customer objections, and log interaction outcomes.</p>
                  </div>
                </article>
                <article>
                  <span>4</span>
                  <div>
                    <strong>AI Summaries &amp; Smart Pipeline</strong>
                    <p>Transform quick notes into clean bulleted next steps and keep upcoming callbacks organized in a calm pipeline.</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="feature-showcase" id="features">
              <div className="feature-showcase-head">
                <p>Everything your call desk needs, shown as simple working moments.</p>
                <h3>Four clean surfaces that keep momentum high and admin work low.</h3>
              </div>

              <div className="feature-columns">
                <article className="showcase-phone">
                  <span>01</span>
                  <div className="phone-mock">
                    <div className="phone-screen">
                      <div className="phone-brand">Call Flow</div>
                      <div className="phone-card face-card">Lead profile ready</div>
                      <div className="phone-card note-card">Follow-up summary prepared</div>
                      <div className="phone-button">Create follow-up</div>
                    </div>
                  </div>
                </article>

                <article className="showcase-panel soft-green">
                  <span>02</span>
                  <small>Smart notes</small>
                  <h4>Call notes turn into clean next steps</h4>
                  <p>Capture the conversation once and let the workspace shape the summary, outcome, and follow-up direction.</p>
                  <div className="showcase-bottom-card dark">
                    <strong>Summary ready</strong>
                    <span>Key objections, decision signals, and next actions are already structured.</span>
                  </div>
                </article>

                <article className="showcase-panel soft-lime">
                  <span>03</span>
                  <small>Reminder flow</small>
                  <h4>Follow-ups stay visible when timing gets messy</h4>
                  <p>Keep reminders, promised callbacks, and status updates lined up so the next move never gets lost.</p>
                  <div className="showcase-bottom-card">
                    <div className="mini-row">
                      <strong>11:00</strong>
                      <span>Call due</span>
                    </div>
                    <div className="mini-row">
                      <strong>14:30</strong>
                      <span>Proposal follow-up</span>
                    </div>
                  </div>
                </article>

                <article className="showcase-panel soft-green">
                  <span>04</span>
                  <small>Clear recovery</small>
                  <h4>Every rep comes back with context intact</h4>
                  <p>When a session breaks or the day gets interrupted, the workspace returns with recent notes, pending tasks, and lead history intact.</p>
                  <div className="showcase-bottom-card">
                    <strong>Workspace restored</strong>
                    <span>Recent lead activity and saved notes are ready the moment you return.</span>
                  </div>
                </article>
              </div>
            </section>

            <section className="landing-cta" id="contact">
              <div className="landing-cta-content">
                <span className="cta-kicker">Start Your Company Setup</span>
                <h3>Register your company and equip your sales team in minutes.</h3>
                <p>Join businesses using Call Flow for clean lead tracking, 1-tap call assistance, and smart AI summaries.</p>
                <div className="landing-cta-actions">
                  <button type="button" className="hero-primary-cta" onClick={() => openAccessModal("register")}>
                    <span>Register Company &amp; Get ID</span>
                    <ActionIcon type="arrow-right" />
                  </button>
                  <button type="button" className="hero-secondary-cta cta-light" onClick={() => openAccessModal("login")}>
                    <ActionIcon type="login" />
                    <span>Company Sign In</span>
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
