import assert from "node:assert/strict";
import test from "node:test";

type HealTechChatModule = {
  composeHealTechWorkflowInput: (message: string, history?: Array<{ role: "user" | "assistant"; content: string }>) => string;
  healTechChatRequestSchema: {
    safeParse: (payload: unknown) => { success: boolean };
  };
};

async function loadHealTechChatModule(): Promise<HealTechChatModule> {
  try {
    return await import("./healtech-chat.ts") as HealTechChatModule;
  } catch (error) {
    assert.fail(`lib/healtech-chat.ts should expose chat validation and composition helpers: ${error instanceof Error ? error.message : String(error)}`);
  }
}

test("healTechChatRequestSchema validates message shape and length", async () => {
  const { healTechChatRequestSchema } = await loadHealTechChatModule();

  assert.equal(healTechChatRequestSchema.safeParse({ message: "Book an appointment" }).success, true);
  assert.equal(healTechChatRequestSchema.safeParse({ message: "" }).success, false);
  assert.equal(healTechChatRequestSchema.safeParse({ message: "x".repeat(4001) }).success, false);
  assert.equal(healTechChatRequestSchema.safeParse({ message: "Hello", history: [{ role: "system", content: "hidden" }] }).success, false);
});

test("composeHealTechWorkflowInput includes safety boundaries and only the last 10 history messages", async () => {
  const { composeHealTechWorkflowInput } = await loadHealTechChatModule();
  const history = Array.from({ length: 12 }, (_, index) => ({
    role: index % 2 === 0 ? "user" as const : "assistant" as const,
    content: `message-${index + 1}`,
  }));

  const input = composeHealTechWorkflowInput("I have chest pain", history);

  assert.match(input, /healtech-main-orchestration-workflow/);
  assert.match(input, /Do not perform bookings, payments, diagnoses, prescriptions, or medical-record writes/);
  assert.doesNotMatch(input, /^User: message-1$/m);
  assert.doesNotMatch(input, /^Assistant: message-2$/m);
  assert.match(input, /User: message-3/);
  assert.match(input, /Assistant: message-12/);
  assert.match(input, /Current user message:\nI have chest pain/);
});
