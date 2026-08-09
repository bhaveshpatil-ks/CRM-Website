import cors from "cors";
import express from "express";
import { createAppUserId, createId, hashPassword, signToken, verifyPassword, verifyToken } from "./auth.js";
import { getOutcomeAutomation, summarizeNote } from "./ai.js";
import { store } from "./store.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Call Flow CRM API",
    ok: true,
    health: "/health",
    apiBase: "/api"
  });
});

const leadSummary = (lead) => ({
  id: lead.id,
  name: lead.name,
  company: lead.company,
  phone: lead.phone,
  email: lead.email,
  source: lead.source,
  status: lead.status,
  score: lead.score,
  lastContactedAt: lead.lastContactedAt,
  nextFollowUpAt: lead.nextFollowUpAt,
  noteCount: lead.notes.length,
  callCount: lead.callLogs.length,
  smsCount: lead.smsLogs.length
});

const sanitizeUser = (user) => ({
  id: user.id,
  role: user.role || "company_admin",
  loginId: user.loginId || "",
  companyName: user.companyName || "",
  approvalStatus: user.approvalStatus || "approved",
  appUserId: user.appUserId,
  name: user.name,
  email: user.email || "",
  isPlatformAdmin: user.role === "platform_admin"
});

const normalize = (value) => value?.trim().toLowerCase() || "";

const findUserByIdentifier = (identifier) => {
  const target = normalize(identifier);
  return store.getUsers().find((user) =>
    [user.appUserId, user.loginId, user.companyName].map(normalize).includes(target)
  );
};

const findApprovedUserByIdentifier = (identifier) => {
  const user = findUserByIdentifier(identifier);
  return user?.approvalStatus === "approved" ? user : null;
};

const sanitizeCompanyRequest = (request) => ({
  id: request.id,
  companyName: request.companyName,
  adminName: request.adminName,
  email: request.email,
  phone: request.phone,
  loginId: request.loginId,
  status: request.status,
  notes: request.notes || "",
  submittedAt: request.submittedAt,
  reviewedAt: request.reviewedAt || null,
  reviewedBy: request.reviewedBy || null
});

const getUserLeads = (userId) => store.getLeads().filter((lead) => lead.userId === userId);

const findLead = (userId, id) =>
  store.getLeads().find((lead) => lead.userId === userId && lead.id === id);

const scheduleFollowUpFromDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(11, 0, 0, 0);
  return date.toISOString();
};

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const session = token ? verifyToken(token) : null;
  const user = session ? store.getUsers().find((item) => item.id === session.userId) : null;

  if (!user) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  req.user = sanitizeUser(user);
  return next();
};

const requirePlatformAdmin = (req, res, next) => {
  if (!req.user?.isPlatformAdmin) {
    return res.status(403).json({ message: "Platform admin access required" });
  }

  return next();
};

const requireCompanyUser = (req, res, next) => {
  if (req.user?.isPlatformAdmin) {
    return res.status(403).json({ message: "Company workspace access required" });
  }

  return next();
};

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/signup", async (req, res) => {
  return res.status(410).json({
    message: "Direct signup is disabled. Register your company for admin approval instead."
  });
});

const createSessionResponse = (user) => ({
  token: signToken({ userId: user.id }),
  user: sanitizeUser(user)
});

app.post("/api/company-auth/lookup", (req, res) => {
  const identifier = req.body.identifier || req.body.appUserId || req.body.loginId;
  const { password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Login ID and password are required" });
  }

  const approvedUser = findApprovedUserByIdentifier(identifier);
  if (!approvedUser) {
    const pending = store.getCompanyRequests().find((request) =>
      [request.loginId, request.companyName, request.email].some((value) => normalize(value) === normalize(identifier))
    );
    return res.status(pending ? 403 : 401).json({
      message: pending ? "This company account is not approved yet" : "Invalid login details"
    });
  }

  if (!approvedUser.passwordHash || !verifyPassword(password, approvedUser.passwordHash)) {
    return res.status(401).json({ message: "Invalid login details" });
  }

  return res.json(createSessionResponse(approvedUser));
});

app.post("/api/admin-auth/lookup", (req, res) => {
  const { loginId, password } = req.body;
  if (!loginId || !password) {
    return res.status(400).json({ message: "Admin ID and password are required" });
  }

  const adminUser = store.getUsers().find(
    (item) => item.role === "platform_admin" && normalize(item.loginId) === normalize(loginId)
  );

  if (!adminUser || !adminUser.passwordHash || !verifyPassword(password, adminUser.passwordHash)) {
    return res.status(401).json({ message: "Invalid login details" });
  }

  return res.json(createSessionResponse(adminUser));
});

app.post("/api/company-requests", async (req, res) => {
  const { companyName, adminName, email, phone, loginId, password, notes } = req.body;

  if (!companyName || !adminName || !email || !phone || !loginId || !password) {
    return res.status(400).json({
      message: "Company name, admin name, email, phone, login ID, and password are required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const normalizedLoginId = normalize(loginId);
  const normalizedCompanyName = normalize(companyName);
  const normalizedEmail = normalize(email);

  const loginTaken = store.getUsers().some((user) => normalize(user.loginId) === normalizedLoginId);
  const companyTaken = store.getUsers().some(
    (user) => normalize(user.companyName) === normalizedCompanyName
  );
  const pendingConflict = store.getCompanyRequests().some(
    (request) =>
      request.status === "pending" &&
      (normalize(request.loginId) === normalizedLoginId ||
        normalize(request.companyName) === normalizedCompanyName ||
        normalize(request.email) === normalizedEmail)
  );

  if (loginTaken || pendingConflict) {
    return res.status(409).json({ message: "That login ID is already in use or waiting for approval" });
  }

  if (companyTaken) {
    return res.status(409).json({ message: "That company is already registered" });
  }

  const requestId = createId("request");

  const requestRecord = {
    id: requestId,
    companyName: companyName.trim(),
    adminName: adminName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    loginId: loginId.trim(),
    passwordHash: hashPassword(password),
    notes: notes?.trim() || "",
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null
  };

  store.getCompanyRequests().push(requestRecord);
  await store.save();

  return res.status(201).json({
    request: sanitizeCompanyRequest(requestRecord),
    message: "Company registration submitted for admin review"
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/admin/company-requests", requireAuth, requirePlatformAdmin, (req, res) => {
  const requests = [...store.getCompanyRequests()].sort(
    (left, right) => new Date(right.submittedAt) - new Date(left.submittedAt)
  );

  res.json(requests.map(sanitizeCompanyRequest));
});

app.patch("/api/admin/company-requests/:id", requireAuth, requirePlatformAdmin, async (req, res) => {
  const requestRecord = store.getCompanyRequests().find((item) => item.id === req.params.id);

  if (!requestRecord) {
    return res.status(404).json({ message: "Company request not found" });
  }

  if (requestRecord.status !== "pending") {
    return res.status(400).json({ message: "This request has already been reviewed" });
  }

  const { action, notes } = req.body;
  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({ message: "Review action must be approved or rejected" });
  }

  requestRecord.status = action;
  requestRecord.reviewedAt = new Date().toISOString();
  requestRecord.reviewedBy = req.user.name;
  requestRecord.notes = notes?.trim() || requestRecord.notes || "";

  let approvedUser = null;
  if (action === "approved") {
    approvedUser = {
      id: requestRecord.id,
      role: "company_admin",
      loginId: requestRecord.loginId,
      companyName: requestRecord.companyName,
      approvalStatus: "approved",
      appUserId: createAppUserId(store.getUsers().map((user) => user.appUserId).filter(Boolean)),
      name: requestRecord.adminName,
      email: requestRecord.email,
      phone: requestRecord.phone,
      passwordHash: requestRecord.passwordHash
    };

    store.getUsers().push(approvedUser);
  }

  await store.save();

  return res.json({
    request: sanitizeCompanyRequest(requestRecord),
    user: approvedUser ? sanitizeUser(approvedUser) : null
  });
});

app.get("/api/dashboard", requireAuth, requireCompanyUser, (req, res) => {
  const leads = getUserLeads(req.user.id);
  const statusCounts = leads.reduce((accumulator, lead) => {
    accumulator[lead.status] = (accumulator[lead.status] || 0) + 1;
    return accumulator;
  }, {});

  const dueToday = leads.filter((lead) => {
    if (!lead.nextFollowUpAt) {
      return false;
    }

    return new Date(lead.nextFollowUpAt) <= new Date();
  }).length;

  const recentActivity = leads
    .flatMap((lead) => [
      ...lead.callLogs.map((item) => ({
        id: item.id,
        type: "Call",
        leadName: lead.name,
        createdAt: item.createdAt,
        summary: item.summary
      })),
      ...lead.smsLogs.map((item) => ({
        id: item.id,
        type: "SMS",
        leadName: lead.name,
        createdAt: item.createdAt,
        summary: item.summary
      })),
      ...lead.notes.map((item) => ({
        id: item.id,
        type: "Note",
        leadName: lead.name,
        createdAt: item.createdAt,
        summary: item.content
      }))
    ])
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 8);

  res.json({
    totalLeads: leads.length,
    dueToday,
    hotLeads: leads.filter((lead) => lead.score >= 80).length,
    statusCounts,
    recentActivity
  });
});

app.get("/api/leads", requireAuth, requireCompanyUser, (req, res) => {
  res.json(getUserLeads(req.user.id).map(leadSummary));
});

app.get("/api/leads/:id", requireAuth, requireCompanyUser, (req, res) => {
  const lead = findLead(req.user.id, req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  return res.json(lead);
});

app.post("/api/leads", requireAuth, requireCompanyUser, async (req, res) => {
  const { name, company, phone, email, source } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const lead = {
    id: createId("lead"),
    userId: req.user.id,
    name,
    company: company || "Independent",
    phone,
    email: email || "",
    source: source || "Manual entry",
    status: "New",
    score: 50,
    lastContactedAt: null,
    nextFollowUpAt: null,
    notes: [],
    callLogs: [],
    smsLogs: []
  };

  store.getLeads().unshift(lead);
  await store.save();
  return res.status(201).json(lead);
});

app.post("/api/leads/:id/notes", requireAuth, requireCompanyUser, async (req, res) => {
  const lead = findLead(req.user.id, req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (!req.body.content) {
    return res.status(400).json({ message: "Note content is required" });
  }

  const note = {
    id: createId("note"),
    createdAt: new Date().toISOString(),
    content: req.body.content
  };

  lead.notes.unshift(note);
  await store.save();
  return res.status(201).json(note);
});

app.post("/api/leads/:id/interactions", requireAuth, requireCompanyUser, async (req, res) => {
  const lead = findLead(req.user.id, req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  const { type, direction, summary, outcome } = req.body;

  if (!type || !summary) {
    return res.status(400).json({ message: "Type and summary are required" });
  }

  const interaction = {
    id: createId(type.toLowerCase()),
    createdAt: new Date().toISOString(),
    direction: direction || "Outbound",
    summary,
    ...(type === "Call" && outcome ? { outcome } : {})
  };

  if (type === "Call") {
    lead.callLogs.unshift(interaction);
    const automation = getOutcomeAutomation(outcome || "Follow-up");
    lead.status = automation.status;
    lead.nextFollowUpAt = scheduleFollowUpFromDays(automation.followUpDays);
  } else if (type === "SMS") {
    lead.smsLogs.unshift(interaction);
  } else {
    return res.status(400).json({ message: "Invalid interaction type" });
  }

  lead.lastContactedAt = interaction.createdAt;
  await store.save();
  return res.status(201).json(interaction);
});

app.patch("/api/leads/:id/follow-up", requireAuth, requireCompanyUser, async (req, res) => {
  const lead = findLead(req.user.id, req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  lead.nextFollowUpAt = req.body.nextFollowUpAt || null;
  await store.save();
  return res.json({ nextFollowUpAt: lead.nextFollowUpAt });
});

app.post("/api/ai/summarize-note", requireAuth, requireCompanyUser, async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ message: "Text is required for summarization" });
  }

  const result = await summarizeNote(text);
  return res.json(result);
});

if (!process.env.VERCEL) {
  const server = app.listen(port, () => {
    console.log(`CRM server running on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the process using that port or set the PORT environment variable to a different port.`);
      process.exit(1);
    }

    console.error("Server error:", err);
    process.exit(1);
  });
}

export default app;