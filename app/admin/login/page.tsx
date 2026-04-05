"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import DesktopFrame from "@/app/_components/DesktopFrame";
import MacintoshArt from "@/app/_components/MacintoshArt";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const embed = new URLSearchParams(window.location.search).get("embed") === "1";
    setIsEmbedded(embed);

    if (!embed) {
      router.replace("/quiz");
    }
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Login failed.");
        return;
      }

      router.push(isEmbedded ? "/admin?embed=1" : "/admin");
      router.refresh();
    } catch {
      setError("Unable to login right now.");
    } finally {
      setLoading(false);
    }
  }

  const loginContent = (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="mac-prompt-shell">
        <div className="mac-chat-row">
          <MacintoshArt />
          <div className="chatbox-mac chatbox-mac-plain">
            <span className="chatbox-legend">Macintosh</span>
            <p style={{ margin: 0 }}>Hi there. Sign in to open the admin dashboard.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="modeless-dialog" style={{ display: "grid", gap: "0.75rem" }}>
        <section className="field-row" style={{ justifyContent: "space-between" }}>
          <label htmlFor="admin-username">Username:</label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            style={{ width: "62%" }}
            autoComplete="username"
          />
        </section>

        <section className="field-row" style={{ justifyContent: "space-between" }}>
          <label htmlFor="admin-password">Password:</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ width: "62%" }}
            autoComplete="current-password"
          />
        </section>

        {error ? <p style={{ margin: 0, color: "#900" }}>{error}</p> : null}

        <section className="field-row" style={{ justifyContent: "flex-end", gap: "0.5rem" }}>
          <button className="btn" type="submit" disabled={loading || !username.trim() || !password.trim()}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </section>
      </form>

      <style jsx>{`
        .mac-chat-row {
          display: grid;
          grid-template-columns: 140px minmax(0, 1fr);
          gap: 1rem;
          align-items: start;
          border: 3px solid #000;
          background: #efefef;
          padding: 8px 10px 10px;
          overflow: visible;
        }

        .mac-prompt-shell {
          border: 3px solid #000;
          background: #d8d8d8;
          padding: 6px;
          overflow: visible;
          align-self: start;
          height: fit-content;
        }

        .chatbox-mac {
          position: relative;
          display: grid;
          gap: 0.75rem;
          background: #fff;
          border: 6px double #000;
          padding: 1rem 0.9rem 0.75rem;
          min-height: 134px;
          overflow: visible;
        }

        .chatbox-mac-plain {
          min-height: 120px;
        }

        .chatbox-legend {
          position: absolute;
          left: 16px;
          top: -10px;
          background: #fff;
          padding: 0.05rem 0.45rem 0;
          font-weight: 600;
          line-height: 1;
          z-index: 3;
        }

        @media screen and (max-width: 700px) {
          .mac-chat-row {
            grid-template-columns: 1fr;
          }

          .chatbox-mac {
            min-height: 0;
          }
        }
      `}</style>
    </div>
  );

  const loginWindow = (
    <div className="window" style={{ width: "min(560px, 100%)", resize: "both", overflow: "auto", minWidth: "420px", minHeight: "260px" }}>
      <div className="title-bar">
        <button aria-label="Close" className="close" />
        <h1 className="title">Admin Login</h1>
        <button aria-label="Resize" className="resize" />
      </div>
      <div className="separator" />

      <div className="window-pane" style={{ display: "grid", gap: "1rem" }}>
        {loginContent}
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <main style={{ minHeight: "100%", padding: "0.75rem" }}>
        {loginContent}
      </main>
    );
  }

  return null;
}
