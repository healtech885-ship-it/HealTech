import assert from "node:assert/strict";
import test from "node:test";

type AzureFoundryWorkflowModule = {
  extractFoundryResponseText: (response: unknown) => string;
  normalizeFoundryWorkflowEndpoint: (endpoint: string) => string;
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
