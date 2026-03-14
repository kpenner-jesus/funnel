// ============================================================
//  app/guests/page.tsx — STEP: HOW MANY GUESTS?
// ============================================================
//
//  This page collects the group size: number of adults,
//  number of children, and (if children > 0) their average age.
//
//  WHY AVERAGE AGE?
//  ─────────────────
//  Wilderness Edge uses age-based kids meal pricing:
//    cost per meal = child's age × $1.50
//  Rather than asking for every child's exact age, we ask for
//  an average. It's fast for the guest and accurate enough for
//  a quote. If your venue uses a flat kids price instead, you
//  can hide the average age field — see the comment below.
//
//  THE ROUTING FORK — THIS IS THE MOST IMPORTANT LOGIC HERE
//  ──────────────────────────────────────────────────────────
//  After submitting, this page checks the adult count against
//  the groupMinimum from siteConfig.ts:
//
//    adults >= groupMinimum  →  /dates  →  /rooms  →  /meeting-rooms  →  /meals  →  /activities  →  /quote
//    adults <  groupMinimum  →  /dates  →  /rooms  →  /quote  (short path, no meeting rooms or meals)
//
//  The routing decision is stored in sessionStorage under the
//  key "isGroupBooking" so every subsequent page knows which
//  path the guest is on. See the comment in the routing section
//  for details.
//
//  CUSTOMIZATION TIPS
//  ───────────────────
//  • To hide the children fields entirely (adults-only venue):
//    Remove the children and childrenAvgAge inputs and their
//    corresponding store setters.
//  • To change the group threshold: edit groupMinimum in
//    siteConfig.ts — no changes needed in this file.
//  • To change the routing destinations: update the
//    router.push() calls in the handleSubmit function below.
//
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "../store";
import { SITE_CONFIG } from "../siteConfig";

export default function GuestsPage() {
  const router = useRouter();

  // Read current values from the store (in case guest came back to edit)
  const storedAdults = useBookingStore((s) => s.adults);
  const storedChildren = useBookingStore((s) => s.children);
  const storedChildrenAvgAge = useBookingStore((s) => s.childrenAvgAge);

  // Store setters — these write values into global state
  const setAdults = useBookingStore((s) => s.setAdults);
  const setChildren = useBookingStore((s) => s.setChildren);
  const setChildrenAvgAge = useBookingStore((s) => s.setChildrenAvgAge);

  // Local form state — we write to the store only on Submit,
  // not on every keystroke, to keep things clean.
  const [adults, setLocalAdults] = useState(
    storedAdults > 0 ? String(storedAdults) : ""
  );
  const [children, setLocalChildren] = useState(
    storedChildren > 0 ? String(storedChildren) : ""
  );
  const [childrenAvgAge, setLocalChildrenAvgAge] = useState(
    storedChildrenAvgAge > 0 ? String(storedChildrenAvgAge) : ""
  );
  const [error, setError] = useState("");

  // ── THE ROUTING FORK ──────────────────────────────────────
  //
  //  groupMinimum comes from siteConfig.ts — change it there.
  //
  //  We store "isGroupBooking" in sessionStorage so that:
  //    • /rooms can show a "meeting rooms coming next" hint
  //    • /meeting-rooms can guard itself (redirect if accessed directly)
  //    • /meals can guard itself the same way
  //    • /quote can decide whether to show the full or short invoice
  //
  //  We use sessionStorage (not the Zustand store) for this flag
  //  because it survives page refreshes without needing persistence
  //  logic in the store. It's a routing signal, not booking data.
  //
  const handleSubmit = () => {
    const adultsNum = parseInt(adults, 10);
    const childrenNum = parseInt(children, 10) || 0;
    const avgAge = parseFloat(childrenAvgAge) || 0;

    // ── VALIDATION ──────────────────────────────────────────
    if (!adults || isNaN(adultsNum) || adultsNum < 1) {
      setError("Please enter at least 1 adult.");
      return;
    }
    if (adultsNum > 500) {
      // Sanity cap — adjust if your venue hosts larger groups
      setError("For groups over 500, please contact us directly.");
      return;
    }
    if (childrenNum < 0) {
      setError("Number of children can't be negative.");
      return;
    }
    if (childrenNum > 0 && (isNaN(avgAge) || avgAge < 1 || avgAge > 17)) {
      setError("Please enter a valid average age for children (1–17).");
      return;
    }

    // ── WRITE TO STORE ───────────────────────────────────────
    setAdults(adultsNum);
    setChildren(childrenNum);
    setChildrenAvgAge(childrenNum > 0 ? avgAge : 0);

    // ── ROUTING DECISION ────────────────────────────────────
    //  This is the fork in the road.
    //  groupMinimum is set in siteConfig.ts (default: 20).
    const isGroup = adultsNum >= SITE_CONFIG.groupMinimum;

    // Store the flag so downstream pages can check it.
    // "true" = full funnel (meeting rooms + meals)
    // "false" = short funnel (straight to quote after rooms)
    sessionStorage.setItem("isGroupBooking", String(isGroup));

    // Both paths go to /dates first, then /rooms.
    // After /rooms, the meeting-rooms page checks the flag.
    router.push("/dates");
  };

  // ── DERIVED STATE ────────────────────────────────────────
  // Show the average age field only when children > 0
  const showAgeField = parseInt(children, 10) > 0;

  // Show a hint about whether this group will get full or short funnel.
  // This helps the guest understand what's coming next.
  const adultsNum = parseInt(adults, 10) || 0;
  const isGroupPreview = adultsNum >= SITE_CONFIG.groupMinimum;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-5">
        <div className="max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-emerald-500 mb-1">
            Step 2 of 8
          </p>
          <h1 className="text-2xl font-bold text-stone-100">
            How many guests?
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            This determines your room options, meals, and meeting spaces.
          </p>
        </div>
      </div>

      {/* ── FORM ────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-6 py-10 space-y-6">

        {/* Adults */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-300">
            Number of adults
          </label>
          <p className="text-xs text-stone-500">
            Anyone 18 and over, or whoever pays the adult meal rate.
          </p>
          <input
            type="number"
            min={1}
            max={500}
            value={adults}
            onChange={(e) => {
              setLocalAdults(e.target.value);
              setError("");
            }}
            placeholder="e.g. 35"
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3
                       text-stone-100 placeholder-stone-500 text-lg
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Children */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-300">
            Number of children
            <span className="text-stone-500 font-normal ml-1">(optional)</span>
          </label>
          <p className="text-xs text-stone-500">
            Children 17 and under. Enter 0 if none are coming.
          </p>
          <input
            type="number"
            min={0}
            max={200}
            value={children}
            onChange={(e) => {
              setLocalChildren(e.target.value);
              setError("");
            }}
            placeholder="e.g. 10"
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3
                       text-stone-100 placeholder-stone-500 text-lg
                       focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Average age — only shown when children > 0 */}
        {showAgeField && (
          <div className="space-y-1 animate-fade-in">
            <label className="block text-sm font-medium text-stone-300">
              Average age of children
            </label>
            <p className="text-xs text-stone-500">
              Used to estimate kids meal costs. A rough average is fine —
              e.g. if you have a 6-year-old and a 10-year-old, enter 8.
            </p>
            <input
              type="number"
              min={1}
              max={17}
              value={childrenAvgAge}
              onChange={(e) => {
                setLocalChildrenAvgAge(e.target.value);
                setError("");
              }}
              placeholder="e.g. 8"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3
                         text-stone-100 placeholder-stone-500 text-lg
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* ── GROUP SIZE HINT ───────────────────────────────────
            Shows the guest what their group size unlocks.
            Only appears once they've typed a number.
        ─────────────────────────────────────────────────────── */}
        {adultsNum > 0 && (
          <div className={`rounded-lg px-4 py-3 text-sm border ${
            isGroupPreview
              ? "bg-emerald-950 border-emerald-800 text-emerald-300"
              : "bg-stone-800 border-stone-700 text-stone-400"
          }`}>
            {isGroupPreview ? (
              <>
                <span className="font-semibold text-emerald-400">
                  Great — group pricing applies.
                </span>{" "}
                You'll be able to select meeting rooms, catered meals, and
                activities after choosing your accommodation.
              </>
            ) : (
              <>
                <span className="font-semibold text-stone-300">
                  Small group or individual booking.
                </span>{" "}
                You'll select your accommodation and dates and we'll prepare
                a quote. Groups of {SITE_CONFIG.groupMinimum}+ unlock catering
                and meeting rooms.
              </>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm bg-red-950 border border-red-800
                        rounded-lg px-4 py-3">
            {error}
          </p>
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
            className="flex-1 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500
                       text-white font-semibold transition-colors"
          >
            Continue →
          </button>
        </div>

        {/* Total guests summary */}
        {adultsNum > 0 && (
          <p className="text-center text-stone-500 text-sm">
            {adultsNum} adult{adultsNum !== 1 ? "s" : ""}
            {parseInt(children, 10) > 0
              ? ` + ${children} child${parseInt(children, 10) !== 1 ? "ren" : ""}`
              : ""}
            {" "}— {adultsNum + (parseInt(children, 10) || 0)} total guests
          </p>
        )}

      </div>
    </div>
  );
}
