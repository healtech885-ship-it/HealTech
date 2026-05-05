"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("If this email exists, Supabase has sent a secure password reset link.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="normal-case text-[17px] font-semibold leading-6 tracking-normal text-[#11191d]">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#11191d]" />
          <Input
            id="email"
            type="email"
            placeholder="name@clinicflow.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-[48px] rounded-lg border border-[#b9c8d0] bg-[#f7fbfd] pl-12 pr-4 text-[18px] text-[#171c1e] shadow-none placeholder:text-[#64717a] focus-visible:border-[#00647c] focus-visible:ring-2 focus-visible:ring-[#00647c]/15"
          />
        </div>
      </div>
      {message ? (
        <p className="rounded-lg border border-[#bde5d1] bg-[#eefbf3] px-4 py-3 text-sm leading-5 text-[#147143]">{message}</p>
      ) : null}
      {error ? <p className="rounded-lg border border-[#f2b7b7] bg-[#fde9e6] px-4 py-3 text-sm leading-5 text-[#ba1a1a]">{error}</p> : null}
      <Button
        type="submit"
        className="h-[48px] w-full rounded-lg bg-[#00758d] text-[17px] font-semibold text-white shadow-[0_10px_22px_rgba(0,100,124,0.16)] transition hover:bg-[#00647c]"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        Send Reset Link
      </Button>
    </form>
  );
}
