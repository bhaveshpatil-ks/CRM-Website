import crypto from "node:crypto";

const today = new Date();

const plusDays = (days) => {
  const value = new Date(today);
  value.setDate(value.getDate() + days);
  return value.toISOString();
};

const createPasswordRecord = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
};

const demoUserId = "user-demo";

export const initialData = {
  users: [
    {
      id: demoUserId,
      role: "platform_admin",
      loginId: "admin",
      companyName: "Call Flow CRM",
      approvalStatus: "approved",
      appUserId: "CALL-240001",
      name: "Demo Admin",
      email: "admin@callflowcrm.com",
      firebaseEmail: "admin@callflowcrm.local",
      firebaseUid: demoUserId,
      passwordHash: createPasswordRecord("demo123")
    }
  ],
  companyRequests: [],
  leads: [
    {
      id: "lead-1",
      userId: demoUserId,
      name: "Ananya Sharma",
      company: "BluePeak Solar",
      phone: "+919876543210",
      email: "ananya@bluepeak.example",
      source: "Website form",
      status: "Warm",
      score: 82,
      lastContactedAt: plusDays(-1),
      nextFollowUpAt: plusDays(1),
      notes: [
        {
          id: "note-1",
          createdAt: plusDays(-2),
          content: "Interested in a weekday demo. Asked for a cost comparison with their current vendor."
        }
      ],
      callLogs: [
        {
          id: "call-1",
          createdAt: plusDays(-1),
          direction: "Outbound",
          outcome: "Interested",
          summary: "Quick intro call. She requested a proposal next week."
        }
      ],
      smsLogs: [
        {
          id: "sms-1",
          createdAt: plusDays(-1),
          direction: "Outbound",
          summary: "Sent demo confirmation and meeting time options."
        }
      ]
    },
    {
      id: "lead-2",
      userId: demoUserId,
      name: "Rahul Verma",
      company: "Northline Fitness",
      phone: "+919811112222",
      email: "rahul@northline.example",
      source: "Referral",
      status: "New",
      score: 64,
      lastContactedAt: null,
      nextFollowUpAt: plusDays(0),
      notes: [],
      callLogs: [],
      smsLogs: []
    },
    {
      id: "lead-3",
      userId: demoUserId,
      name: "Sara Khan",
      company: "KiteCart",
      phone: "+919955667788",
      email: "sara@kitecart.example",
      source: "LinkedIn outreach",
      status: "Proposal",
      score: 91,
      lastContactedAt: plusDays(-3),
      nextFollowUpAt: plusDays(2),
      notes: [
        {
          id: "note-2",
          createdAt: plusDays(-4),
          content: "Wants a custom onboarding workflow and team reporting."
        }
      ],
      callLogs: [
        {
          id: "call-2",
          createdAt: plusDays(-3),
          direction: "Outbound",
          outcome: "Follow-up",
          summary: "Deep-dive product call with two stakeholders."
        }
      ],
      smsLogs: []
    }
  ]
};
