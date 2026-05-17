import { NextResponse } from "next/server";
import { FoundryWorkflowError, invokeHealTechWorkflow, resolveHealTechChatProviderConfig } from "@/lib/azure-foundry-workflow";
import { composeHealTechWorkflowInput, healTechChatRequestSchema } from "@/lib/healtech-chat";
import { resolveCurrentProfile } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const accessResponse = await requireChatAccess();
  if (accessResponse) return accessResponse;

  const payload = await readJson(request);
  if (!payload.ok) {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = healTechChatRequestSchema.safeParse(payload.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Send a non-empty message up to 4000 characters." },
      { status: 400 },
    );
  }

  const configResult = resolveHealTechChatProviderConfig();
  if (!configResult.ok) {
    console.error("HealTech AI chat missing server configuration", safeLogJson({
      missing: configResult.missing,
    }));
    return NextResponse.json(
      { error: "Missing server configuration", missing: configResult.missing },
      { status: 500 },
    );
  }

  try {
    const { role: userRole, userId } = await resolveUserContext();
    const effectiveRole = userRole ?? parsed.data.userRole;
    const input = composeHealTechWorkflowInput(parsed.data.message, parsed.data.history ?? [], effectiveRole);
    const result = await invokeHealTechWorkflow(input, {
      config: configResult.config,
      userRole: effectiveRole,
      userId,
    });
    return NextResponse.json({ message: result.text });
  } catch (error) {
    logChatError(error);
    const safeError = getSafeErrorResponse(error);
    return NextResponse.json(safeError.body, { status: safeError.status });
  }
}

async function requireChatAccess() {
  if (!hasSupabaseEnv()) return null;

  const result = await resolveCurrentProfile();
  if (result.status === "unauthenticated") {
    return NextResponse.json({ error: "Please sign in to use the AI assistant." }, { status: 401 });
  }
  if (result.status === "inactive") {
    return NextResponse.json({ error: "Your account is not active." }, { status: 403 });
  }
  if (result.status === "missing-role") {
    return NextResponse.json({ error: "Your account is missing a valid role." }, { status: 403 });
  }

  return null;
}

async function resolveUserContext(): Promise<{ role?: string; userId?: string }> {
  if (!hasSupabaseEnv()) return {};
  const result = await resolveCurrentProfile();
  if (result.status === "authenticated" || result.status === "inactive") {
    return { role: result.profile.role, userId: result.profile.id };
  }
  return {};
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
      body: { error: "The AI assistant could not process the request. Please try again." },
    };
  }

  if (typeof error.status === "number") {
    return {
      status: providerErrorStatus(error.status),
      body: {
        error: "AI provider request failed",
        status: error.status,
      },
    };
  }

  switch (error.code) {
    case "missing_config":
      return {
        status: 500,
        body: { error: "The AI assistant is not configured yet." },
      };
    case "auth_unavailable":
      return {
        status: 500,
        body: { error: "The AI assistant cannot authenticate with Azure right now." },
      };
    case "unauthorized":
      return {
        status: 502,
        body: { error: "Azure rejected the AI assistant authentication." },
      };
    case "forbidden":
      return {
        status: 502,
        body: { error: "The Azure identity or API key cannot access the workflow." },
      };
    case "rate_limited":
      return {
        status: 429,
        body: { error: "The AI assistant is receiving too many requests. Please try again shortly." },
      };
    case "azure_unavailable":
      return {
        status: 503,
        body: { error: "The AI assistant is temporarily unavailable. Please try again shortly." },
      };
    case "protocol_unavailable":
      return {
        status: 502,
        body: { error: "The Azure workflow protocol is not available. Republish the Agent Application with the Responses protocol." },
      };
    case "invalid_response":
      return {
        status: 502,
        body: { error: "The AI assistant returned an unreadable response." },
      };
    case "request_failed":
    default:
      return {
        status: 502,
        body: { error: "The AI assistant could not reach Azure." },
      };
  }
}

function logChatError(error: unknown) {
  if (error instanceof FoundryWorkflowError) {
    console.error("HealTech AI chat Azure error", safeLogJson({
      code: error.code,
      message: getErrorMessage(error),
      provider: error.provider ?? null,
      status: error.status ?? null,
      responseBody: error.responseBody ?? null,
      cause: getErrorCauseDetails(error),
      stack: error.stack ?? null,
    }));
    return;
  }

  console.error("HealTech AI chat unexpected exception", safeLogJson({
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack ?? null : null,
  }));
}

function providerErrorStatus(status: number) {
  if (status === 429) return 429;
  if (status >= 500) return 503;
  return 502;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getErrorCauseDetails(error: Error) {
  const cause = (error as Error & { cause?: unknown }).cause;
  if (!cause) return null;
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
      stack: cause.stack ?? null,
    };
  }
  return String(cause);
}

function safeLogJson(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "{\"message\":\"Unable to serialize log details\"}";
  }
}
