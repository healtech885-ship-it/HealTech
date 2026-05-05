import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";
import { corsHeaders } from "./cors.ts";

export type UserRole = "admin" | "reception" | "doctor" | "lab" | "pharmacy" | "patient";

type HandlerContext = {
  body: Record<string, unknown>;
  userId: string;
  role: UserRole;
  supabase: ReturnType<typeof createClient>;
  userSupabase: ReturnType<typeof createClient>;
};

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function createRoleHandler(allowedRoles: UserRole[], handler: (context: HandlerContext) => Promise<unknown>) {
  return async (request: Request) => {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("ANON_KEY");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !anonKey || !serviceRoleKey) {
        throw new Error("Supabase function environment is not configured");
      }

      const userSupabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: request.headers.get("Authorization") ?? "" } },
      });
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const { data: authData, error: authError } = await userSupabase.auth.getUser();
      if (authError || !authData.user) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile || profile.status !== "active") {
        return jsonResponse({ error: "Forbidden" }, 403);
      }

      if (!allowedRoles.includes(profile.role)) {
        return jsonResponse({ error: "Forbidden" }, 403);
      }

      const body = request.method === "GET" ? {} : await request.json();
      const result = await handler({ body, userId: authData.user.id, role: profile.role, supabase, userSupabase });
      return jsonResponse({ data: result });
    } catch (error) {
      return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error" }, 400);
    }
  };
}

export async function audit(
  supabase: ReturnType<typeof createClient>,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}
