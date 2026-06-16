"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { requestPasswordReset } from "@/src/actions/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-[hsl(var(--foreground-muted))] text-center">
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
          </p>
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-[hsl(var(--accent))] hover:underline">
              Back to login
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@institution.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Send reset link
          </Button>
          <div className="text-center">
            <a href="/login" className="text-sm text-[hsl(var(--accent))] hover:underline">
              Back to login
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
