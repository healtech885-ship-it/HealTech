import { DefaultAzureCredential } from "@azure/identity";

const AZURE_AI_SCOPE = "https://ai.azure.com/.default";
const DEFAULT_API_VERSION = "2025-11-15-preview";

export type HealTechWorkflowResult = {
  text: string;
  raw: unknown;
};

export type FoundryWorkflowErrorCode =
  | "missing_config"
  | "auth_unavailable"
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "azure_unavailable"
  | "protocol_unavailable"
  | "request_failed"
  | "invalid_response";

export class FoundryWorkflowError extends Error {
  code: FoundryWorkflowErrorCode;
  status?: number;

  constructor(code: FoundryWorkflowErrorCode, message: string, status?: number) {
    super(message);
    this.name = "FoundryWorkflowError";
    this.code = code;
    this.status = status;
  }
}

let credential: DefaultAzureCredential | null = null;

function getCredential() {
  if (!credential) {
    credential = new DefaultAzureCredential();
  }
  return credential;
}

export function normalizeFoundryWorkflowEndpoint(endpoint: string) {
  const trimmed = endpoint.trim();
  if (!trimmed) {
    throw new FoundryWorkflowError("missing_config", "Azure Foundry workflow endpoint is not configured.");
  }

  try {
    const url = new URL(trimmed);
    url.search = "";
    url.hash = "";
    url.pathname = normalizeFoundryWorkflowPath(url.pathname);
    return url.toString().replace(/\/$/, "");
  } catch {
    const withoutQuery = trimmed.split(/[?#]/)[0] ?? "";
    return normalizeFoundryWorkflowPath(withoutQuery);
  }
}

export function extractFoundryResponseText(response: unknown) {
  if (!isRecord(response)) {
    throw new FoundryWorkflowError("invalid_response", "Azure Foundry returned an invalid response.");
  }

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const textParts = getOutputTextParts(response.output);
  if (textParts.length > 0) {
    return textParts.join("\n").trim();
  }

  throw new FoundryWorkflowError("invalid_response", "Azure Foundry returned an empty response.");
}

export async function invokeHealTechWorkflow(input: string): Promise<HealTechWorkflowResult> {
  const endpoint = process.env.AZURE_FOUNDRY_WORKFLOW_ENDPOINT;
  if (!endpoint) {
    throw new FoundryWorkflowError("missing_config", "Azure Foundry workflow endpoint is not configured.");
  }

  const baseUrl = normalizeFoundryWorkflowEndpoint(endpoint);
  const apiVersion = process.env.AZURE_FOUNDRY_API_VERSION || DEFAULT_API_VERSION;
  const token = await getAccessToken();
  const response = await fetch(`${baseUrl}/responses?api-version=${encodeURIComponent(apiVersion)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      store: false,
    }),
  });

  const raw = await parseResponseBody(response);
  if (!response.ok) {
    throwFoundryHttpError(response.status);
  }

  return {
    text: extractFoundryResponseText(raw),
    raw,
  };
}

async function getAccessToken() {
  try {
    const token = await getCredential().getToken(AZURE_AI_SCOPE);
    if (!token?.token) {
      throw new FoundryWorkflowError("auth_unavailable", "Azure authentication did not return an access token.");
    }
    return token.token;
  } catch (error) {
    if (error instanceof FoundryWorkflowError) throw error;
    throw new FoundryWorkflowError("auth_unavailable", "Azure authentication is not available for this environment.");
  }
}

async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (!response.ok) return text;
    throw new FoundryWorkflowError("invalid_response", "Azure Foundry returned a non-JSON response.", response.status);
  }
}

function throwFoundryHttpError(status: number): never {
  if (status === 401) {
    throw new FoundryWorkflowError("unauthorized", "Azure Foundry rejected the request authentication.", status);
  }
  if (status === 403) {
    throw new FoundryWorkflowError("forbidden", "Azure Foundry access is forbidden for this identity.", status);
  }
  if (status === 429) {
    throw new FoundryWorkflowError("rate_limited", "Azure Foundry rate limit was reached.", status);
  }
  if (status >= 500) {
    throw new FoundryWorkflowError("azure_unavailable", "Azure Foundry is temporarily unavailable.", status);
  }
  if (status === 404 || status === 405) {
    throw new FoundryWorkflowError("protocol_unavailable", "Azure Foundry workflow protocol endpoint is unavailable.", status);
  }
  throw new FoundryWorkflowError("request_failed", "Azure Foundry request failed.", status);
}

function getOutputTextParts(output: unknown) {
  if (!Array.isArray(output)) return [];

  const parts: string[] = [];
  for (const item of output) {
    if (!isRecord(item)) continue;
    const content = item.content;
    if (!Array.isArray(content)) continue;

    for (const contentItem of content) {
      const text = getTextFromContentItem(contentItem);
      if (text) parts.push(text);
    }
  }
  return parts;
}

function getTextFromContentItem(contentItem: unknown) {
  if (!isRecord(contentItem)) return null;
  if (typeof contentItem.text === "string" && contentItem.text.trim()) return contentItem.text.trim();
  if (isRecord(contentItem.text) && typeof contentItem.text.value === "string" && contentItem.text.value.trim()) {
    return contentItem.text.value.trim();
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeFoundryWorkflowPath(value: string) {
  const withoutTrailingSlash = value.replace(/\/+$/, "");
  const withoutPublishedProtocol = withoutTrailingSlash.replace(/\/protocols\/[^/]+$/, "");
  return withoutPublishedProtocol.endsWith("/protocols/openai")
    ? withoutPublishedProtocol
    : `${withoutPublishedProtocol}/protocols/openai`;
}
