"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm({
  submitLabel = "Update Password",
  passwordLabel = "New Password",
  confirmLabel = "Confirm Password",
  showStrength = true,
  showArrow = false,
}: {
  submitLabel?: string;
  passwordLabel?: string;
  confirmLabel?: string;
  showStrength?: boolean;
  showArrow?: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated successfully. You can now sign in.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="normal-case text-[17px] font-medium leading-6 tracking-normal text-[#11191d]">
          {passwordLabel}
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#5f6c73]" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="••••••••••••••"
            className="h-[60px] rounded-lg border border-[#b9c8d0] bg-white pl-12 pr-14 text-[20px] tracking-[0.28em] text-[#171c1e] shadow-none placeholder:text-[#66737b] focus-visible:border-[#00647c] focus-visible:ring-2 focus-visible:ring-[#00647c]/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#11191d] transition hover:text-[#00647c]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
          </button>
        </div>
        {showStrength ? (
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-3 gap-1.5">
              <span className="h-1 rounded-full bg-[#00758d]" />
              <span className="h-1 rounded-full bg-[#00758d]" />
              <span className="h-1 rounded-full bg-[#d9e1e4]" />
            </div>
            <p className="text-right text-[15px] leading-5 text-[#303b40]">Strong password</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="normal-case text-[17px] font-medium leading-6 tracking-normal text-[#11191d]">
          {confirmLabel}
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#5f6c73]" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            placeholder="••••••••••••"
            className="h-[60px] rounded-lg border border-[#b9c8d0] bg-white pl-12 pr-14 text-[20px] tracking-[0.28em] text-[#171c1e] shadow-none placeholder:text-[#66737b] focus-visible:border-[#00647c] focus-visible:ring-2 focus-visible:ring-[#00647c]/15"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#11191d] transition hover:text-[#00647c]"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-[#bde5d1] bg-[#eefbf3] px-4 py-3 text-sm leading-5 text-[#147143]">{message}</p>
      ) : null}
      {error ? <p className="rounded-lg border border-[#f2b7b7] bg-[#fde9e6] px-4 py-3 text-sm leading-5 text-[#ba1a1a]">{error}</p> : null}

      <Button
        type="submit"
        className="h-[60px] w-full rounded-lg bg-[#00758d] text-[17px] font-semibold text-white shadow-[0_10px_22px_rgba(0,100,124,0.16)] transition hover:bg-[#00647c]"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {submitLabel}
        {showArrow && !loading ? <ArrowRight className="h-5 w-5" /> : null}
      </Button>
    </form>
  );
}
