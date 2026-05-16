import { NextResponse } from "next/server";
import { FoundryWorkflowError, invokeHealTechWorkflow } from "@/lib/azure-foundry-workflow";
import { composeHealTechWorkflowInput, healTechChatRequestSchema } from "@/lib/healtech-chat";
import { resolveCurrentProfile } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const accessResponse = await requireChatAccess();
  if (accessResponse) return accessResponse;

  const payload = await readJson(request);
  if (!payload.ok) {
    return NextResponse.json({ ok: false, error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = healTechChatRequestSchema.safeParse(payload.value);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Send a non-empty message up to 4000 characters." },
      { status: 400 },
    );
  }

  try {
    const input = composeHealTechWorkflowInput(parsed.data.message, parsed.data.history ?? []);
    const result = await invokeHealTechWorkflow(input);
    return NextResponse.json({ ok: true, reply: result.text });
  } catch (error) {
    const safeError = getSafeErrorResponse(error);
    logChatError(error);
    return NextResponse.json({ ok: false, error: safeError.message }, { status: safeError.status });
  }
}

async function requireChatAccess() {
  if (!hasSupabaseEnv()) return null;

  const result = await resolveCurrentProfile();
  if (result.status === "unauthenticated") {
    return NextResponse.json({ ok: false, error: "Please sign in to use the AI assistant." }, { status: 401 });
  }
  if (result.status === "inactive") {
    return NextResponse.json({ ok: false, error: "Your account is not active." }, { status: 403 });
  }
  if (result.status === "missing-role") {
    return NextResponse.json({ ok: false, error: "Your account is missing a valid role." }, { status: 403 });
  }

  return null;
}

async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await request.json() as unknown };
  } catch {
    return { ok: false };
  }
}

function getSafeErrorResponse(error: unknown) {
  if (!(error instanceof FoundryWorkflowError)) {
    return {
      status: 500,
      message: "The AI assistant could not process the request. Please try again.",
    };
  }

  switch (error.code) {
    case "missing_config":
      return {
        status: 500,
        message: "The AI assistant is not configured yet.",
      };
    case "auth_unavailable":
      return {
        status: 500,
        message: "The AI assistant cannot authenticate with Azure right now.",
      };
    case "unauthorized":
      return {
        status: 502,
        message: "Azure rejected the AI assistant authentication.",
      };
    case "forbidden":
      return {
        status: 502,
        message: "The Azure identity needs Azure AI User access to the workflow.",
      };
    case "rate_limited":
      return {
        status: 429,
        message: "The AI assistant is receiving too many requests. Please try again shortly.",
      };
    case "azure_unavailable":
      return {
        status: 503,
        message: "The AI assistant is temporarily unavailable. Please try again shortly.",
      };
    case "protocol_unavailable":
      return {
        status: 502,
        message: "The Azure workflow protocol is not available. Republish the Agent Application with the Responses protocol.",
      };
    case "invalid_response":
      return {
        status: 502,
        message: "The AI assistant returned an unreadable response.",
      };
    case "request_failed":
    default:
      return {
        status: 502,
        message: "The AI assistant could not reach the Azure workflow.",
      };
  }
}

function logChatError(error: unknown) {
  if (error instanceof FoundryWorkflowError) {
    console.error("HealTech AI chat Azure error", {
      code: error.code,
      status: error.status ?? null,
    });
    return;
  }

  console.error("HealTech AI chat unexpected error");
}
