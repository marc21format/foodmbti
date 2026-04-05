"use client";
import React from "react";

function toHumanHeader(header: string) {
  return header
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function SelectedRowDialog({ data }: { data: Record<string, unknown> }) {
  // Remove __rowNum__ if present
  const entries = Object.entries(data).filter(([key]) => key !== "__rowNum__");

  function handleClose() {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("row");
      window.location.href = url.toString();
    }
  }

  return (
    <div className="window" style={{ width: "100%", margin: "0 auto 0.75rem", boxSizing: "border-box" }}>
      <div className="title-bar">
        <button
          aria-label="Close"
          className="close"
          onClick={handleClose}
          tabIndex={0}
          type="button"
          style={{ cursor: 'pointer' }}
        />
        <h2 className="title" style={{ fontSize: '1rem' }}>Selected row details</h2>
        <button aria-label="Resize" className="resize" tabIndex={-1} style={{ pointerEvents: 'none' }} />
      </div>
      <div style={{ background: "#fff", padding: "0.75rem", border: 0, overflow: "hidden" }}>
        <div
          style={{
            fontSize: "0.95rem",
            display: "grid",
            gap: "0.35rem",
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          {entries.map(([key, value]) => (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "170px minmax(0, 1fr)", alignItems: "start", gap: "0.6rem" }}>
              <span style={{ fontWeight: 500 }}>{toHumanHeader(key)}</span>
              <span style={{ wordBreak: "break-word" }}>{String(value ?? "")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
