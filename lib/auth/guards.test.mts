import assert from "node:assert/strict";
import test from "node:test";
import { getRoleAccessDecision } from "./access.ts";
import type { AppProfile, UserRole } from "../../types/app.types.ts";

function profile(role: UserRole, status: AppProfile["status"] = "active"): AppProfile {
  return {
    id: `test-${role}`,
    full_name: "Test User",
    email: `${role}@healtech.local`,
    role,
    status,
  };
}

test("getRoleAccessDecision redirects unauthenticated users to login", () => {
  assert.deepEqual(getRoleAccessDecision({ status: "unauthenticated" }, ["admin"]), { type: "redirect", destination: "/login" });
});

test("getRoleAccessDecision redirects inactive users to inactive login error", () => {
  assert.deepEqual(getRoleAccessDecision({ status: "inactive", profile: profile("doctor", "inactive") }, ["doctor"]), {
    type: "redirect",
    destination: "/login?error=inactive",
  });
});

test("getRoleAccessDecision redirects missing roles to missing-role login error", () => {
  assert.deepEqual(getRoleAccessDecision({ status: "missing-role" }, ["admin"]), {
    type: "redirect",
    destination: "/login?error=missing-role",
  });
});

test("getRoleAccessDecision allows matching roles", () => {
  assert.equal(getRoleAccessDecision({ status: "authenticated", profile: profile("doctor") }, ["doctor"]).type, "allow");
  assert.equal(getRoleAccessDecision({ status: "authenticated", profile: profile("reception") }, ["reception"]).type, "allow");
  assert.equal(getRoleAccessDecision({ status: "authenticated", profile: profile("pharmacy") }, ["pharmacy"]).type, "allow");
});

test("getRoleAccessDecision redirects cross-role access to unauthorized", () => {
  assert.deepEqual(getRoleAccessDecision({ status: "authenticated", profile: profile("doctor") }, ["admin"]), {
    type: "redirect",
    destination: "/unauthorized",
  });
  assert.deepEqual(getRoleAccessDecision({ status: "authenticated", profile: profile("reception") }, ["lab"]), {
    type: "redirect",
    destination: "/unauthorized",
  });
  assert.deepEqual(getRoleAccessDecision({ status: "authenticated", profile: profile("pharmacy") }, ["admin"]), {
    type: "redirect",
    destination: "/unauthorized",
  });
});
