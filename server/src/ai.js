const actionKeywords = ["call", "demo", "proposal", "follow up", "meeting", "pricing", "sms"];
const outcomeRules = [
  { label: "Interested", patterns: ["interested", "looks good", "send pricing", "proposal", "demo"] },
  { label: "Callback", patterns: ["callback", "call back", "tomorrow", "later", "next week", "busy"] },
  { label: "No Answer", patterns: ["no answer", "did not answer", "missed", "unreachable"] },
  { label: "Closed", patterns: ["confirmed", "approved", "signed", "closed"] }
];

const outcomeConfig = {
  Interested: {
    status: "Warm",
    followUpDays: 1
  },
  Callback: {
    status: "Warm",
    followUpDays: 1
  },
  "No Answer": {
    status: "New",
    followUpDays: 0
  },
  Closed: {
    status: "Closed",
    followUpDays: 7
  },
  "Follow-up": {
    status: "Proposal",
    followUpDays: 2
  }
};

function firstSentences(text, max = 2) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return sentences.slice(0, max);
}

function detectActions(text) {
  const lower = text.toLowerCase();
  return actionKeywords.filter((keyword) => lower.includes(keyword));
}

function detectOutcome(text) {
  const lower = text.toLowerCase();
  const match = outcomeRules.find((rule) =>
    rule.patterns.some((pattern) => lower.includes(pattern))
  );

  return match?.label || "Follow-up";
}

function buildNextStep(text, outcome) {
  const lower = text.toLowerCase();

  if (outcome === "Interested") {
    if (lower.includes("pricing")) {
      return "Share pricing details and lock a follow-up call.";
    }

    if (lower.includes("demo")) {
      return "Schedule the requested demo and confirm the meeting time.";
    }

    return "Send the promised material and move the lead to the next stage.";
  }

  if (outcome === "Callback") {
    return "Create a follow-up reminder and reconnect at the requested time.";
  }

  if (outcome === "No Answer") {
    return "Try again later and send a short SMS follow-up.";
  }

  if (outcome === "Closed") {
    return "Confirm onboarding or delivery details with the customer.";
  }

  return "Review the conversation and set a clear next action.";
}

function buildSuggestedSms(text, outcome) {
  if (outcome === "Interested") {
    return "Hi, thanks for the call. I am sharing the next details here and will follow up shortly.";
  }

  if (outcome === "Callback") {
    return "Hi, as discussed I will reconnect at the requested time. Let me know if anything changes.";
  }

  if (outcome === "No Answer") {
    return "Hi, I tried reaching you just now. Let me know a good time to connect.";
  }

  if (outcome === "Closed") {
    return "Great speaking with you. I will share the next onboarding details shortly.";
  }

  return "Hi, just following up on our conversation. Let me know the best next step from your side.";
}

function getOutcomeConfig(outcome) {
  return outcomeConfig[outcome] || outcomeConfig["Follow-up"];
}

function buildFallbackSummary(text) {
  const sentences = firstSentences(text);
  const actions = detectActions(text);
  const outcome = detectOutcome(text);
  const summaryLines = [];

  if (sentences.length) {
    summaryLines.push(`Summary: ${sentences.join(" ")}`);
  }

  summaryLines.push(`Outcome: ${outcome}.`);

  if (actions.length) {
    summaryLines.push(`Key topics: ${actions.join(", ")}.`);
  }

  summaryLines.push(`Next step: ${buildNextStep(text, outcome)}`);

  return summaryLines.join("\n");
}

export async function summarizeNote(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { summary: "", provider: "fallback" };
  }

  const ollamaModel = process.env.OLLAMA_MODEL;
  const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";

  if (ollamaModel) {
    try {
      const response = await fetch(ollamaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: ollamaModel,
          stream: false,
          prompt:
            "Summarize this CRM note in 2 short lines. Include a concrete next step if one is implied.\n\n" +
            trimmed
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response?.trim()) {
          const outcome = detectOutcome(trimmed);
          return {
            summary: data.response.trim(),
            provider: `ollama:${ollamaModel}`,
            outcome,
            nextStep: buildNextStep(trimmed, outcome),
            suggestedSms: buildSuggestedSms(trimmed, outcome),
            recommendedStatus: getOutcomeConfig(outcome).status,
            followUpDays: getOutcomeConfig(outcome).followUpDays
          };
        }
      }
    } catch {
      // Fall back to local heuristic summary when Ollama is unavailable.
    }
  }

  const outcome = detectOutcome(trimmed);

  return {
    summary: buildFallbackSummary(trimmed),
    provider: "fallback",
    outcome,
    nextStep: buildNextStep(trimmed, outcome),
    suggestedSms: buildSuggestedSms(trimmed, outcome),
    recommendedStatus: getOutcomeConfig(outcome).status,
    followUpDays: getOutcomeConfig(outcome).followUpDays
  };
}

export function getOutcomeAutomation(outcome) {
  return getOutcomeConfig(outcome);
}
