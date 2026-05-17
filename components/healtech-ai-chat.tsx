"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Bot, Loader2, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackAlert } from "@/components/ui/data-state";
import { Textarea } from "@/components/ui/textarea";
import { resolveTextDirection } from "@/lib/text-direction";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatApiResponse =
  | { message: string; reply?: string; ok?: true }
  | { error: string; status?: number; missing?: string[]; ok?: false };

export function HealTechAIChat({ className, userRole }: { className?: string; userRole?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmedInput = input.trim();
  const remainingCharacters = 4000 - input.length;
  const canSend = trimmedInput.length > 0 && input.length <= 4000 && !loading;
  const inputDirection = resolveTextDirection(input);

  const history = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/healtech-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history,
          userRole,
        }),
      });

      const data = await parseChatResponse(response);
      if (!response.ok || "error" in data) {
        throw new Error(formatChatApiError(data));
      }
      const assistantText = data.message ?? data.reply;
      if (!assistantText) {
        throw new Error("The AI assistant returned an empty response.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantText,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The AI assistant could not process the request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <FeedbackAlert tone="warning" message="For chest pain, severe symptoms, or emergencies, call local emergency services immediately." />

      <div className="min-h-[280px] space-y-3 rounded-lg border border-[#d4e0e8] bg-[#f8fbfd] p-3">
        {messages.length === 0 ? (
          <div className="flex min-h-[250px] items-center justify-center text-center text-sm text-[#607084]">
            <p>Start a conversation with the HealTech care coordinator.</p>
          </div>
        ) : (
          messages.map((message) => <ChatBubble key={message.id} message={message} />)
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-sm font-medium text-[#607084]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing response
          </div>
        ) : null}
      </div>

      {error ? <FeedbackAlert tone="danger" message={error} /> : null}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Textarea
          aria-label="Message"
          className="min-h-24 resize-none bg-white text-start [unicode-bidi:plaintext]"
          dir={inputDirection}
          maxLength={4000}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Message HealTech"
          style={{ unicodeBidi: "plaintext" }}
          value={input}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={cn("text-xs font-medium text-[#607084]", remainingCharacters < 0 && "text-[#a24130]")}>
            {remainingCharacters} characters remaining
          </p>
          <Button type="submit" disabled={!canSend} className="h-10 sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const Icon = isUser ? UserRound : Bot;
  const direction = resolveTextDirection(message.content);

  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9eef3] text-[#006d86]">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[82%] whitespace-pre-wrap rounded-lg px-3 py-2 text-start text-sm leading-6 shadow-sm [unicode-bidi:plaintext]",
          isUser ? "bg-[#00758d] text-white" : "border border-[#d4e0e8] bg-white text-[#17212f]",
        )}
        dir={direction}
        lang={direction === "rtl" ? "ar" : undefined}
        style={{ unicodeBidi: "plaintext" }}
      >
        {message.content}
      </div>
      {isUser ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e3f7fa] text-[#006d86]">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );
}

async function parseChatResponse(response: Response): Promise<ChatApiResponse> {
  try {
    return await response.json() as ChatApiResponse;
  } catch {
    return {
      ok: false,
      error: "The AI assistant returned an invalid response.",
    };
  }
}

function formatChatApiError(data: ChatApiResponse) {
  if (!("error" in data)) return "The AI assistant could not process the request.";
  if (data.missing?.length) return `${data.error}: ${data.missing.join(", ")}`;
  if (typeof data.status === "number") return `${data.error} (status ${data.status})`;
  return data.error;
}
