"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export function PasswordForm() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function change(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: String(data.get("current") || ""),
        newPassword: String(data.get("next") || ""),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(res.ok ? "Password changed." : (json.error ?? "Change failed."));
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <Card>
      <h2 className="font-semibold">Change password</h2>
      <form onSubmit={change} className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Current password<input name="current" type="password" required minLength={8} className="mt-1 w-full rounded-lg border p-2" /></label>
        <label className="text-sm">New password<input name="next" type="password" required minLength={8} className="mt-1 w-full rounded-lg border p-2" /></label>
        <div><button disabled={busy} className="rounded-xl border px-4 py-2">{busy ? "..." : "Change password"}</button>
        {msg ? <p role="status" className="mt-2 text-sm">{msg}</p> : null}</div>
      </form>
    </Card>
  );
}
