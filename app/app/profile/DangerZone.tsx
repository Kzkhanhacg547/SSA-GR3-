"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui";

export function DangerZone() {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function logout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  async function remove() {
    if (!confirm("Delete your account and all learning data? This cannot be undone.")) return;
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) {
      setMsg("Delete failed.");
      return;
    }
    await signOut({ redirect: false });
    router.push("/register");
  }

  return (
    <Card>
      <h2 className="font-semibold">Account</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <button onClick={logout} className="rounded-xl border px-4 py-2">Log out</button>
        <button onClick={remove} className="rounded-xl bg-red-600 px-4 py-2 text-white">Delete account</button>
      </div>
      {msg ? <p role="alert" className="mt-2 text-sm">{msg}</p> : null}
    </Card>
  );
}
