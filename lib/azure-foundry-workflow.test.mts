import assert from "node:assert/strict";
import test from "node:test";

type AzureFoundryWorkflowModule = {
  FoundryWorkflowError: new (...args: never[]) => Error & { responseBody?: string; status?: number };
  buildFoundryWorkflowResponsesUrl: (endpoint: string, apiVersion?: string) => string;
  extractFoundryResponseText: (response: unknown) => string;
  invokeHealTechWorkflow: (
    input: string,
    options?: {
      env?: Record<string, string | undefined>;
      fetchImpl?: typeof fetch;
      getAccessToken?: () => Promise<string>;
    },
  ) => Promise<{ text: string; raw: unknown }>;
  normalizeFoundryWorkflowEndpoint: (endpoint: string) => string;
  resolveHealTechChatProviderConfig: (env?: Record<string, string | undefined>) => { ok: true } | { ok: false; missing: string[] };
};

async function loadAzureFoundryWorkflowModule(): Promise<AzureFoundryWorkflowModule> {
  try {
    return await import("./azure-foundry-workflow.ts") as AzureFoundryWorkflowModule;
  } catch (error) {
    assert.fail(`lib/azure-foundry-workflow.ts should expose Azure Foundry workflow helpers: ${error instanceof Error ? error.message : String(error)}`);
  }
}

test("normalizeFoundryWorkflowEndpoint appends the OpenAI protocol path once", async () => {
  const { normalizeFoundryWorkflowEndpoint } = await loadAzureFoundryWorkflowModule();

  assert.equal(
    normalizeFoundryWorkflowEndpoint("https://example.services.ai.azure.com/api/projects/healtech"),
    "https://example.services.ai.azure.com/api/projects/healtech/protocols/openai",
  );
  assert.equal(
    normalizeFoundryWorkflowEndpoint("https://example.services.ai.azure.com/api/projects/healtech/protocols/openai/"),
    "https://example.services.ai.azure.com/api/projects/healtech/protocols/openai",
  );
});

test("normalizeFoundryWorkflowEndpoint accepts a published activity protocol endpoint", async () => {
  const { normalizeFoundryWorkflowEndpoint } = await loadAzureFoundryWorkflowModule();

  assert.equal(
    normalizeFoundryWorkflowEndpoint("https://healtech-ai-foundry.services.ai.azure.com/api/projects/healtech-agent-project/applications/healtech-main-orchestration-workflow/protocols/activityprotocol?api-version=2025-11-15-preview"),
    "https://healtech-ai-foundry.services.ai.azure.com/api/projects/healtech-agent-project/applications/healtech-main-orchestration-workflow/protocols/openai",
  );
});

test("buildFoundryWorkflowResponsesUrl accepts a published OpenAI responses endpoint", async () => {
  const { buildFoundryWorkflowResponsesUrl } = await loadAzureFoundryWorkflowModule();

  assert.equal(
    buildFoundryWorkflowResponsesUrl(
      "https://healtech-ai-foundry.services.ai.azure.com/api/projects/healtech-agent-project/applications/healtech-main-orchestration-workflow/protocols/openai/responses",
      "2025-11-15-preview",
    ),
    "https://healtech-ai-foundry.services.ai.azure.com/api/projects/healtech-agent-project/applications/healtech-main-orchestration-workflow/protocols/openai/responses?api-version=2025-11-15-preview",
  );
});

test("resolveHealTechChatProviderConfig reports missing Azure OpenAI API key before provider calls", async () => {
  const { resolveHealTechChatProviderConfig } = await loadAzureFoundryWorkflowModule();

  assert.deepEqual(
    resolveHealTechChatProviderConfig({
      OPENAI_BASE_URL: "https://healtech-ai-foundry.openai.azure.com/openai/v1",
      OPENAI_MODEL: "healtech-chat",
    }),
    { ok: false, missing: ["OPENAI_API_KEY"] },
  );
});

test("resolveHealTechChatProviderConfig requires Entra service principal values", async () => {
  const { resolveHealTechChatProviderConfig } = await loadAzureFoundryWorkflowModule();

  assert.deepEqual(
    resolveHealTechChatProviderConfig({
      AZURE_AUTH_MODE: "entra",
      AZURE_FOUNDRY_WORKFLOW_ENDPOINT:
        "https://healtech-ai-foundry.services.ai.azure.com/api/projects/healtech-agent-project/applications/healtech-main-orchestration-workflow/protocols/openai/responses",
      AZURE_CLIENT_ID: "client-id",
      AZURE_TENANT_ID: "tenant-id",
    }),
    { ok: false, missing: ["AZURE_CLIENT_SECRET"] },
  );
});

test("invokeHealTechWorkflow sends Entra bearer token to Foundry workflow endpoint", async () => {
  const { invokeHealTechWorkflow } = await loadAzureFoundryWorkflowModule();
  let authorizationHeader: string | null = null;
  let requestBody: unknown = null;

  const result = await invokeHealTechWorkflow("hello", {
    env: {
      AZURE_AUTH_MODE: "entra",
      AZURE_FOUNDRY_WORKFLOW_ENDPOINT:
        "https://healtech-ai-foundry.services.ai.azure.com/api/projects/healtech-agent-project/applications/healtech-main-orchestration-workflow/protocols/openai/responses",
      AZURE_CLIENT_ID: "client-id",
      AZURE_TENANT_ID: "tenant-id",
      AZURE_CLIENT_SECRET: "test-secret",
      AZURE_FOUNDRY_API_VERSION: "2025-11-15-preview",
    },
    getAccessToken: async () => "test-access-token",
    fetchImpl: async (_url, init) => {
      authorizationHeader = new Headers(init?.headers).get("authorization");
      requestBody = JSON.parse(String(init?.body));
      return Response.json({ output_text: "Hello from Foundry" });
    },
  });

  assert.equal(authorizationHeader, "Bearer test-access-token");
  assert.deepEqual(requestBody, { input: "hello" });
  assert.equal(result.text, "Hello from Foundry");
});

test("invokeHealTechWorkflow keeps Azure response body on provider errors", async () => {
  const { FoundryWorkflowError, invokeHealTechWorkflow } = await loadAzureFoundryWorkflowModule();

  await assert.rejects(
    invokeHealTechWorkflow("hello", {
      env: {
        AZURE_AUTH_MODE: "api_key",
        AZURE_FOUNDRY_WORKFLOW_ENDPOINT:
          "https://healtech-ai-foundry.services.ai.azure.com/api/projects/healtech-agent-project/applications/healtech-main-orchestration-workflow/protocols/openai/responses",
        AZURE_FOUNDRY_API_KEY: "test-key",
        AZURE_FOUNDRY_API_VERSION: "2025-11-15-preview",
      },
      fetchImpl: async () => new Response("provider rejected request", { status: 400 }),
    }),
    (error: unknown) => {
      assert.ok(error instanceof FoundryWorkflowError);
      assert.equal(error.status, 400);
      assert.equal(error.responseBody, "provider rejected request");
      return true;
    },
  );
});

test("extractFoundryResponseText prefers output_text", async () => {
  const { extractFoundryResponseText } = await loadAzureFoundryWorkflowModule();

  assert.equal(extractFoundryResponseText({ output_text: "Appointment request draft created." }), "Appointment request draft created.");
});

test("extractFoundryResponseText reads text items from output content", async () => {
  const { extractFoundryResponseText } = await loadAzureFoundryWorkflowModule();

  const text = extractFoundryResponseText({
    output: [
      {
        type: "message",
        content: [
          { type: "output_text", text: "Please seek urgent medical care." },
          { type: "refusal", refusal: "ignored" },
        ],
      },
      {
        type: "message",
        content: [{ type: "text", text: "Call local emergency services if symptoms are severe." }],
      },
    ],
  });

  assert.equal(text, "Please seek urgent medical care.\nCall local emergency services if symptoms are severe.");
});
