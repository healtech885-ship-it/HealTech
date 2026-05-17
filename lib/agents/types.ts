// ─── HealTech Agent Domain Types ────────────────────────────────────────────
// Shared type definitions for the HealTech multi-agent system.

import type { UserRole } from "@/types/app.types";

// ─── Safety Classes ─────────────────────────────────────────────────────────

/** Action safety classification per the agentic reference architecture. */
export type SafetyClass = "read" | "draft" | "commit" | "restricted";

// ─── Trace & Audit ──────────────────────────────────────────────────────────

/** Unique trace ID for AI observability. Format: HT-AI-YYYY-NNNNNN */
export type AgentTraceId = string;

/** Generate a new trace ID for an AI interaction. */
export function generateTraceId(): AgentTraceId {
  const now = new Date();
  const year = now.getFullYear();
  const seq = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HT-AI-${year}-${seq}`;
}

// ─── Agent Identity ─────────────────────────────────────────────────────────

/** Names of specialist agents in the HealTech system. */
export type AgentName =
  | "supervisor"
  | "reception"
  | "doctor"
  | "lab"
  | "pharmacy"
  | "admin"
  | "patient"
  | "knowledge"
  | "compliance";

// ─── Tool Request / Response Contracts ──────────────────────────────────────

/** Standard tool request envelope per Section 10 of the reference. */
export type AgentToolRequest = {
  trace_id: AgentTraceId;
  actor: {
    user_id: string;
    role: UserRole;
    session_id: string;
  };
  intent: string;
  resource: {
    patient_id?: string;
    visit_id?: string;
  };
  payload: Record<string, unknown>;
  approval: {
    required: boolean;
    approved: boolean;
    approved_by: string | null;
    approved_at: string | null;
  };
};

/** Standard tool response envelope per Section 11 of the reference. */
export type AgentToolResponse = {
  trace_id: AgentTraceId;
  status: "success" | "error" | "pending_approval";
  action_type: SafetyClass;
  requires_approval: boolean;
  summary: string;
  data: Record<string, unknown>;
  warnings: string[];
  next_actions: AgentNextAction[];
};

export type AgentNextAction = {
  id: string;
  label: string;
  type: SafetyClass;
  allowed_roles: UserRole[];
};

// ─── Action Card (for approval UI) ─────────────────────────────────────────

export type ActionCard = {
  id: string;
  title: string;
  summary: string;
  patient_name?: string;
  visit_code?: string;
  agent_recommendation: string;
  source_data: string;
  risk_level: "low" | "medium" | "high";
  required_role: UserRole[];
  status: "pending" | "approved" | "rejected" | "expired";
  created_at: string;
};

// ─── Chat Types ─────────────────────────────────────────────────────────────

export type AgentChatRole = "user" | "assistant";

export type AgentChatMessage = {
  id: string;
  role: AgentChatRole;
  content: string;
  trace_id?: AgentTraceId;
  agent_name?: AgentName;
  action_cards?: ActionCard[];
};
