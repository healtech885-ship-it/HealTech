import { z } from "zod";

const VALID_ROLES = ["admin", "reception", "doctor", "lab", "pharmacy", "patient"] as const;

export const healTechChatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

export const healTechChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z.array(healTechChatHistoryMessageSchema).max(50).optional(),
  userRole: z.enum(VALID_ROLES).optional(),
});

export type HealTechChatHistoryMessage = z.infer<typeof healTechChatHistoryMessageSchema>;
export type HealTechChatRequest = z.infer<typeof healTechChatRequestSchema>;

const MAX_HISTORY_MESSAGES = 10;

export function composeHealTechWorkflowInput(
  message: string,
  history: HealTechChatHistoryMessage[] = [],
  userRole?: string,
) {
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
  const contextLines = recentHistory.map((item) => `${roleLabel(item.role)}: ${item.content.trim()}`);

  return [
    "Workflow application: healtech-main-orchestration-workflow.",
    userRole ? `Authenticated user role: ${userRole}.` : "Authenticated user role: unknown.",
    "Healthcare safety boundaries: read, reason, summarize, and prepare draft responses only. Do not perform bookings, payments, diagnoses, prescriptions, or medical-record writes. Any sensitive action must remain pending human or system approval. Emergency messages must receive emergency guidance only, not a diagnosis.",
    "Conversation context (oldest to newest):",
    contextLines.length > 0 ? contextLines.join("\n") : "No prior conversation context was provided.",
    "Current user message:",
    message.trim(),
  ].join("\n");
}

function roleLabel(role: HealTechChatHistoryMessage["role"]) {
  return role === "user" ? "User" : "Assistant";
}
