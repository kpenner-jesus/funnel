"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "../store";

export default function DatesPage() {
  const router   = useRouter();
  const storedIn  = useBookingStore((s) => s.checkIn);
  const storedOut = useBookingStore((s) => s.checkOut);
  const setCheckIn  = useBookingStore((s) => s.setCheckIn);
  const setCheckOut = useBookingStore((s) => s.setCheckOut);
  const adults    = useBookingStore((s) => s.adults);
  const children  = useBookingStore((s) => s.children);

  const [checkIn,  setLocalIn]  = useState(storedIn  || "");
  const [checkOut, setLocalOut] = useState(storedOut || "");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const progress = Math.round((3 / 8) * 100);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  })();

  const fmtDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" }) : "";

  const handleContinue = () => {
    if (!checkIn)  { setError("Please select a check-in date."); return; }
    if (!checkOut) { setError("Please select a check-out date."); return; }
    if (checkOut <= checkIn) { setError("Check-out must be after check-in."); return; }
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    router.push("/rooms");
  };

  return (
    <div className="tf-step">
      <div className="tf-progress">
        <div className="tf-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="tf-body">
        <div className="tf-step-label tf-animate">Step 3 of 8</div>

        <h1 className="tf-question tf-animate tf-animate-delay-1">
          When are you <em>arriving</em>?
        </h1>

        <p className="tf-subtext tf-animate tf-animate-delay-2">
          {adults} adult{adults !== 1 ? "s" : ""}{children > 0 ? ` + ${children} children` : ""} · Select your check-in and check-out dates.
        </p>

        <div className="tf-animate tf-animate-delay-2" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>

          {/* Check-in */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Check-in
            </div>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setLocalIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setLocalOut("");
                setError("");
              }}
              className="tf-input-box"
            />
          </div>

          {/* Check-out */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Check-out
            </div>
            <input
              type="date"
              min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0] : today}
              value={checkOut}
              onChange={(e) => { setLocalOut(e.target.value); setError(""); }}
              className="tf-input-box"
            />
          </div>
        </div>

        {/* Nights summary */}
        {nights > 0 && (
          <div className="tf-callout tf-animate" style={{ marginBottom: "1.5rem" }}>
            <strong>{nights} night{nights !== 1 ? "s" : ""}</strong> — {fmtDate(checkIn)} to {fmtDate(checkOut)}
          </div>
        )}

        {error && <div className="tf-alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <button className="tf-ok" onClick={handleContinue}>
          OK
          <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div className="tf-hint"><kbd>Enter</kbd><span>to continue</span></div>
        <button className="tf-back" onClick={() => router.back()}>← Back</button>
      </div>
    </div>
  );
}
