// ============================================================
//  app/dates/page.tsx — STEP: SELECT CHECK-IN & CHECK-OUT
// ============================================================
//
//  This page collects the guest's arrival and departure dates.
//  It sits between /guests and /rooms in the funnel flow.
//
//  WHAT THIS PAGE DOES
//  ────────────────────
//  • Shows two date inputs — check-in and check-out
//  • Validates that check-out is after check-in
//  • Saves the dates to the Zustand store
//  • Continues to /rooms
//
//  CUSTOMIZATION TIPS
//  ───────────────────
//  • To set a minimum stay: add a minNights check in handleSubmit
//  • To block specific dates (e.g. holidays): add a disabled
//    dates check before saving
//  • To change the date format displayed: update the input
//    type="date" — browsers handle the locale display automatically
//
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "../store";

export default function DatesPage() {
  const router = useRouter();

  // ── STORE ────────────────────────────────────────────────
  const storedCheckIn  = useBookingStore((s) => s.checkIn);
  const storedCheckOut = useBookingStore((s) => s.checkOut);
  const setCheckIn     = useBookingStore((s) => s.setCheckIn);
  const setCheckOut    = useBookingStore((s) => s.setCheckOut);
  const adults         = useBookingStore((s) => s.adults);
  const children       = useBookingStore((s) => s.children);

  // ── LOCAL STATE ──────────────────────────────────────────
  const [checkIn,  setLocalCheckIn]  = useState(storedCheckIn  || "");
  const [checkOut, setLocalCheckOut] = useState(storedCheckOut || "");
  const [error, setError] = useState("");

  // ── HELPERS ──────────────────────────────────────────────
  // Today's date in YYYY-MM-DD format — used as the min date
  // so guests can't accidentally select dates in the past.
  const today = new Date().toISOString().split("T")[0];

  // Calculate nights for the preview label
  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  })();

  // ── NAVIGATION ───────────────────────────────────────────
  const handleSubmit = () => {
    if (!checkIn) {
      setError("Please select a check-in date.");
      return;
    }
    if (!checkOut) {
      setError("Please select a check-out date.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be at least one night after check-in.");
      return;
    }

    setCheckIn(checkIn);
    setCheckOut(checkOut);
    router.push("/rooms");
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-5">
        <div className="max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-emerald-500 mb-1">
            Step 3 of 8
          </p>
          <h1 className="text-2xl font-bold text-stone-100">
            Select your dates
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {adults > 0 && (
              <>
                {adults} adult{adults !== 1 ? "s" : ""}
                {children > 0 && ` + ${children} children`}
                {" · "}
              </>
            )}
            When would you like to arrive and depart?
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10 space-y-6">

        {/* ── CHECK-IN ─────────────────────────────────────────── */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-300">
            Check-in date
          </label>
          <p className="text-xs text-stone-500">
            The day your group arrives and checks in.
          </p>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => {
              setLocalCheckIn(e.target.value);
              // If check-out is now before the new check-in, clear it
              if (checkOut && e.target.value >= checkOut) {
                setLocalCheckOut("");
              }
              setError("");
            }}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg
                       px-4 py-3 text-stone-100 focus:outline-none
                       focus:ring-2 focus:ring-emerald-500
                       [color-scheme:dark]"
          />
        </div>

        {/* ── CHECK-OUT ─────────────────────────────────────────── */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-300">
            Check-out date
          </label>
          <p className="text-xs text-stone-500">
            The day your group departs.
          </p>
          <input
            type="date"
            // Minimum check-out is one day after check-in
            min={checkIn
              ? new Date(new Date(checkIn).getTime() + 86400000)
                  .toISOString().split("T")[0]
              : today}
            value={checkOut}
            onChange={(e) => {
              setLocalCheckOut(e.target.value);
              setError("");
            }}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg
                       px-4 py-3 text-stone-100 focus:outline-none
                       focus:ring-2 focus:ring-emerald-500
                       [color-scheme:dark]"
          />
        </div>

        {/* ── NIGHTS PREVIEW ───────────────────────────────────────
            Shows a confirmation once both dates are set.
        ─────────────────────────────────────────────────────── */}
        {nights > 0 && (
          <div className="bg-emerald-950 border border-emerald-800 rounded-lg
                          px-4 py-3 text-sm text-emerald-300">
            <span className="font-semibold">{nights} night{nights !== 1 ? "s" : ""}</span>
            {" "}— your group will be with us from{" "}
            <span className="font-semibold">
              {new Date(checkIn + "T00:00:00").toLocaleDateString("en-CA", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </span>
            {" "}to{" "}
            <span className="font-semibold">
              {new Date(checkOut + "T00:00:00").toLocaleDateString("en-CA", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </span>.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-red-400 text-sm bg-red-950 border border-red-800
                          rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* ── NAVIGATION ───────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 rounded-lg border border-stone-700
                       text-stone-300 hover:bg-stone-800 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-lg bg-emerald-600
                       hover:bg-emerald-500 text-white font-semibold
                       transition-colors"
          >
            Continue →
          </button>
        </div>

      </div>
    </div>
  );
}
