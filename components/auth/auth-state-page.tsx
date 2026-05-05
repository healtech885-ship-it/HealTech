import Link from "next/link";
import { ArrowLeft, MailCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export function AuthStatePage({
  title,
  description,
  mode,
}: {
  title: string;
  description: string;
  mode: "email" | "password" | "message" | "error";
}) {
  const Icon = mode === "error" ? ShieldAlert : MailCheck;
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "email" ? (
            <ForgotPasswordForm />
          ) : null}
          {mode === "password" ? (
            <ResetPasswordForm />
          ) : null}
          {mode === "message" || mode === "error" ? (
            <div className="rounded-lg border border-border bg-muted p-4 text-sm leading-6 text-[var(--on-surface-variant)]">
              {description}
            </div>
          ) : null}
          <Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
