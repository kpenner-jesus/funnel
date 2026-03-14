// ============================================================
//  app/activities/page.tsx — STEP: SELECT ACTIVITIES
// ============================================================
//
//  This page lets guests browse and select optional activities
//  to add to their booking. Each activity has a per-person
//  price and a participant count the guest sets directly.
//
//  WHAT THIS PAGE DOES
//  ────────────────────
//  Reads the activities array from siteConfig.ts and renders
//  a card for each one. Activities are grouped into category
//  tabs (Water, Nature, Creative, etc.) so guests can quickly
//  find what interests them.
//
//  Each card shows:
//    • A photo of the activity
//    • Name, description and price per person
//    • A participant count input (how many people want this)
//    • A live subtotal for that activity
//
//  PARTICIPANT COUNT LOGIC
//  ────────────────────────
//  The count defaults to the total group size (adults + children)
//  as a convenient starting point, but guests can adjust it down.
//  For example: a group of 40 might only want 20 people doing
//  the canoe trip — they can set it to 20.
//
//  ROUTING
//  ────────
//  Activities is step 7 of the full funnel (groups 20+).
//  It sits between /meals and /contact.
//  Small groups do not reach this page.
//
//  CUSTOMIZATION TIPS
//  ───────────────────
//  • To add, remove or edit activities: update siteConfig.activities.
//    No changes needed in this file.
//  • To add a new category tab: add activities with a new category
//    string in siteConfig.ts — the tab appears automatically.
//  • To make activities available to small groups too: remove the
//    isGroupBooking check from the routing in guests/page.tsx and
//    add /activities to the short funnel path.
//  • To disable activities entirely: set activities: [] in
//    siteConfig.ts and remove the /activities step from routing.
//
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "../store";
import { SITE_CONFIG } from "../siteConfig";

// ── CATEGORY DISPLAY NAMES ───────────────────────────────────
// Maps the raw category string from siteConfig to a display
// label and an emoji icon shown on the tab.
// If you add a new category in siteConfig.ts, add it here too.
const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  water:        { label: "Water",        icon: "🚣" },
  nature:       { label: "Nature",       icon: "🌲" },
  teambuilding: { label: "Team Building",icon: "🤝" },
  creative:     { label: "Creative",     icon: "🎨" },
  recreation:   { label: "Recreation",   icon: "🎱" },
  winter:       { label: "Winter",       icon: "⛷️" },
};

// Fallback for any category not listed above
const DEFAULT_CATEGORY = { label: "Other", icon: "✨" };

export default function ActivitiesPage() {
  const router = useRouter();

  // ── STORE ────────────────────────────────────────────────
  const storedCounts = useBookingStore((s) => s.activityCounts);
  const setActivityCount = useBookingStore((s) => s.setActivityCount);
  const adults = useBookingStore((s) => s.adults);
  const children = useBookingStore((s) => s.children);

  // Total group size — used as the default participant count
  const totalGuests = adults + children;

  // ── LOCAL STATE ──────────────────────────────────────────
  const [counts, setCounts] = useState<Record<string, number>>(
    storedCounts || {}
  );

  // Which category tab is currently active.
  // Starts on the first category found in the activities list.
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (SITE_CONFIG.activities.length === 0) return "";
    return SITE_CONFIG.activities[0].category;
  });

  // ── DERIVED DATA ─────────────────────────────────────────

  // Build a sorted, deduplicated list of all categories present
  // in siteConfig.activities. Order matches siteConfig order.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const activity of SITE_CONFIG.activities) {
      if (!seen.has(activity.category)) {
        seen.add(activity.category);
        result.push(activity.category);
      }
    }
    return result;
  }, []);

  // Activities in the currently selected tab
  const visibleActivities = SITE_CONFIG.activities.filter(
    (a) => a.category === activeCategory
  );

  // How many activities have been selected across all categories
  const totalActivitiesSelected = Object.values(counts).filter(
    (v) => v > 0
  ).length;

  // Running activities subtotal across all selections
  const activitiesSubtotal = SITE_CONFIG.activities.reduce((sum, activity) => {
    return sum + activity.price * (counts[activity.sku] ?? 0);
  }, 0);

  // ── HELPERS ──────────────────────────────────────────────

  // Get the participant count for an activity (0 if not selected)
  const getCount = (sku: string) => counts[sku] ?? 0;

  // Set a participant count directly (e.g. from a number input).
  // Clamps to 0–totalGuests range.
  const setCount = (sku: string, value: number) => {
    const clamped = Math.min(
      Math.max(0, isNaN(value) ? 0 : value),
      // Allow slightly more than group size in case extra people join
      totalGuests > 0 ? totalGuests * 2 : 999
    );
    const updated = { ...counts, [sku]: clamped };
    setCounts(updated);
    setActivityCount(sku, clamped);
  };

  // Increment or decrement participant count by 1
  const adjustCount = (sku: string, delta: number) => {
    setCount(sku, getCount(sku) + delta);
  };

  // ── NAVIGATION ───────────────────────────────────────────
  const handleContinue = () => {
    // Activities are optional — guests can continue with none selected
    router.push("/contact");
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-emerald-500 mb-1">
            Step 7 of 8
          </p>
          <h1 className="text-2xl font-bold text-stone-100">
            Add activities
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {totalGuests > 0
              ? `${totalGuests} guests · prices are per person`
              : "Prices shown are per person"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── INTRO NOTE ───────────────────────────────────────
            Sets expectations: activities are optional add-ons,
            not commitments. The coordinator will confirm.
        ─────────────────────────────────────────────────────── */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg
                        px-5 py-4 mb-6 text-sm text-stone-400">
          <span className="text-stone-300 font-medium">All activities are optional.</span>{" "}
          Set the number of participants for anything your group is
          interested in. Your coordinator will confirm scheduling,
          seasonal availability, and any activity-specific details
          when they follow up on your quote.
        </div>

        {SITE_CONFIG.activities.length === 0 ? (
          // Shown if activities array is empty in siteConfig.ts
          <div className="text-center py-20 text-stone-500">
            <p className="text-lg">No activities configured.</p>
            <p className="text-sm mt-2">
              Add activities to the activities array in siteConfig.ts.
            </p>
          </div>
        ) : (
          <>
            {/* ── CATEGORY TABS ──────────────────────────────────
                One tab per unique category. Tabs are generated
                automatically from whatever categories exist in
                siteConfig.activities — no hardcoding needed.
                A dot indicator shows which tabs have selections.
            ─────────────────────────────────────────────────── */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {categories.map((cat) => {
                const meta = CATEGORY_LABELS[cat] ?? DEFAULT_CATEGORY;
                const isActive = cat === activeCategory;

                // Count how many activities in this category are selected
                const selectedInCategory = SITE_CONFIG.activities.filter(
                  (a) => a.category === cat && (counts[a.sku] ?? 0) > 0
                ).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2
                                rounded-full text-sm font-medium transition-colors
                                border relative ${
                      isActive
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-500"
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                    {/* Selection dot indicator */}
                    {selectedInCategory > 0 && (
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isActive ? "bg-white" : "bg-emerald-500"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── ACTIVITY CARDS ─────────────────────────────────
                Cards for the currently selected category tab.
                To add or remove activities, edit siteConfig.ts.
            ─────────────────────────────────────────────────── */}
            <div className="space-y-4">
              {visibleActivities.map((activity) => {
                const qty = getCount(activity.sku);
                const isSelected = qty > 0;
                const lineTotal = activity.price * qty;

                return (
                  <div
                    key={activity.sku}
                    className={`rounded-xl border overflow-hidden transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-stone-900"
                        : "border-stone-800 bg-stone-900 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">

                      {/* ── ACTIVITY PHOTO ──────────────────────────
                          Falls back gracefully if imageUrl is missing.
                      ─────────────────────────────────────────────── */}
                      <div className="sm:w-48 sm:flex-shrink-0 h-44 sm:h-auto overflow-hidden">
                        {activity.imageUrl ? (
                          <img
                            src={activity.imageUrl}
                            alt={activity.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-800 flex items-center
                                          justify-center text-stone-600 text-sm">
                            No photo
                          </div>
                        )}
                      </div>

                      {/* ── ACTIVITY DETAILS ────────────────────────
                          Name, price, description, participant input.
                      ─────────────────────────────────────────────── */}
                      <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                        <div>
                          {/* Name and price */}
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="text-base font-semibold text-stone-100
                                           leading-snug">
                              {activity.name}
                            </h3>
                            <div className="text-right flex-shrink-0">
                              <div className="text-emerald-400 font-bold">
                                ${activity.price % 1 === 0
                                  ? activity.price
                                  : activity.price.toFixed(2)}
                              </div>
                              <div className="text-stone-500 text-xs">
                                {activity.unit}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-stone-400 text-sm leading-relaxed">
                            {activity.description}
                          </p>
                        </div>

                        {/* ── PARTICIPANT CONTROLS ─────────────────────
                            +/− buttons plus a direct number input.
                            The input lets guests type a number directly
                            for large groups rather than clicking 40 times.
                        ──────────────────────────────────────────────── */}
                        <div className="flex items-center justify-between pt-3
                                        border-t border-stone-800">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustCount(activity.sku, -1)}
                              disabled={qty === 0}
                              className="w-8 h-8 rounded-full border border-stone-700
                                         text-stone-300 hover:bg-stone-800
                                         disabled:opacity-30 disabled:cursor-not-allowed
                                         text-base font-bold flex items-center
                                         justify-center transition-colors"
                            >
                              −
                            </button>

                            {/* Direct number input — more practical for large groups */}
                            <input
                              type="number"
                              min={0}
                              value={qty === 0 ? "" : qty}
                              onChange={(e) =>
                                setCount(activity.sku, parseInt(e.target.value, 10))
                              }
                              placeholder="0"
                              className="w-16 text-center bg-stone-800 border border-stone-700
                                         rounded-lg px-2 py-1.5 text-stone-100 text-sm
                                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <button
                              onClick={() => adjustCount(activity.sku, 1)}
                              className="w-8 h-8 rounded-full border border-stone-700
                                         text-stone-300 hover:bg-stone-800
                                         text-base font-bold flex items-center
                                         justify-center transition-colors"
                            >
                              +
                            </button>

                            <span className="text-stone-500 text-xs ml-1">
                              participants
                            </span>
                          </div>

                          {/* Live line total */}
                          {isSelected && (
                            <div className="text-right text-sm">
                              <div className="text-stone-400 text-xs">
                                {qty} × ${activity.price % 1 === 0
                                  ? activity.price
                                  : activity.price.toFixed(2)}
                              </div>
                              <div className="text-emerald-400 font-semibold">
                                = ${lineTotal % 1 === 0
                                  ? lineTotal.toLocaleString()
                                  : lineTotal.toFixed(2)}
                              </div>
                            </div>
                          )}

                          {/* Quick-fill button: set count to full group size */}
                          {!isSelected && totalGuests > 0 && (
                            <button
                              onClick={() => setCount(activity.sku, totalGuests)}
                              className="text-xs text-emerald-600 hover:text-emerald-400
                                         underline transition-colors"
                            >
                              Select all {totalGuests}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── RUNNING TOTAL ────────────────────────────────────
            Shows the activities subtotal once something is selected.
            Only visible when at least one activity has participants.
        ─────────────────────────────────────────────────────── */}
        {totalActivitiesSelected > 0 && (
          <div className="mt-6 bg-stone-900 border border-emerald-800 rounded-xl
                          px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-stone-400">
                {totalActivitiesSelected} activit{totalActivitiesSelected !== 1 ? "ies" : "y"} selected
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                before tax
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold text-xl">
                ${activitiesSubtotal % 1 === 0
                  ? activitiesSubtotal.toLocaleString()
                  : activitiesSubtotal.toFixed(2)}
              </div>
              <div className="text-stone-500 text-xs">activities subtotal</div>
            </div>
          </div>
        )}

        {/* ── NAVIGATION ───────────────────────────────────────── */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 rounded-lg border border-stone-700
                       text-stone-300 hover:bg-stone-800 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-3 rounded-lg bg-emerald-600
                       hover:bg-emerald-500 text-white font-semibold
                       transition-colors"
          >
            {totalActivitiesSelected > 0
              ? `Continue with ${totalActivitiesSelected} activit${totalActivitiesSelected !== 1 ? "ies" : "y"} →`
              : "Continue without activities →"}
          </button>
        </div>

        <p className="text-center text-stone-600 text-xs mt-4">
          Next: contact details, then we'll prepare your full quote.
        </p>

      </div>
    </div>
  );
}
