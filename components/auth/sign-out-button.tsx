"use client";

import { LogOut } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({
  label = "Sign out",
  iconClassName = "h-4 w-4",
  ...props
}: ButtonProps & { label?: string; iconClassName?: string }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleSignOut} {...props}>
      <LogOut className={iconClassName} />
      {label}
    </Button>
  );
}
