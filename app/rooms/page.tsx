// ============================================================
//  app/rooms/page.tsx — STEP: SELECT GUEST ROOMS
// ============================================================
//
//  This page shows all available accommodation types and lets
//  the guest choose how many of each they need.
//
//  WHAT THIS PAGE DOES
//  ────────────────────
//  Reads the rooms array from siteConfig.ts and renders a
//  card for each one. Each card shows:
//    • A photo of the room
//    • Room name, description and feature highlights
//    • Price per night
//    • A +/− quantity selector (capped at maxQty)
//    • A live nightly subtotal when qty > 0
//
//  A running total at the bottom updates as the guest selects
//  rooms, giving them a real-time accommodation cost preview.
//
//  ROUTING
//  ────────
//  This page sits between /dates and either:
//    • /meeting-rooms  (if isGroupBooking === "true")
//    • /quote          (if isGroupBooking === "false")
//
//  The routing flag was set in guests/page.tsx based on whether
//  the adult count met the groupMinimum threshold. This page
//  reads that flag to know where to send the guest next.
//
//  CUSTOMIZATION TIPS
//  ───────────────────
//  • To add, remove or edit rooms: update siteConfig.rooms only.
//    No changes are needed in this file.
//  • To change the "per night" label: search for "/ night" below.
//  • To require at least one room before continuing: uncomment
//    the validation block in handleContinue marked below.
//  • To show a capacity hint (e.g. "sleeps 4"): add a capacity
//    field to each room in siteConfig.ts and display it here
//    alongside the features list.
//
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "../store";
import { SITE_CONFIG } from "../siteConfig";

export default function RoomsPage() {
  const router = useRouter();

  // ── STORE ────────────────────────────────────────────────
  // Read existing selections in case the guest came back to edit
  const storedCounts = useBookingStore((s) => s.roomCounts);
  const setRoomCount = useBookingStore((s) => s.setRoomCount);
  const adults = useBookingStore((s) => s.adults);
  const children = useBookingStore((s) => s.children);
  const checkIn = useBookingStore((s) => s.checkIn);
  const checkOut = useBookingStore((s) => s.checkOut);

  // ── LOCAL STATE ──────────────────────────────────────────
  // Keep a local copy so the UI responds instantly on +/−
  // without triggering a full global re-render each time.
  const [counts, setCounts] = useState<Record<string, number>>(
    storedCounts || {}
  );
  const [error, setError] = useState("");

  // ── HELPERS ──────────────────────────────────────────────

  // Calculate the number of nights from the dates stored in the store.
  // This powers the per-room and total subtotal previews.
  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const diff =
      new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  })();

  // Format a date string (YYYY-MM-DD) into something readable (e.g. "Jun 14")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
    });
  };

  // Get the current quantity for a room SKU (default 0)
  const getCount = (sku: string) => counts[sku] ?? 0;

  // Increment or decrement a room's count, clamped between 0 and maxQty.
  // Writes to both local state (for instant UI) and the global store.
  const adjustCount = (sku: string, delta: number, maxQty: number) => {
    const current = getCount(sku);
    const next = Math.min(maxQty, Math.max(0, current + delta));
    const updated = { ...counts, [sku]: next };
    setCounts(updated);
    setRoomCount(sku, next);
    setError("");
  };

  // Total number of rooms selected across all types
  const totalRoomsSelected = Object.values(counts).reduce(
    (sum, qty) => sum + qty,
    0
  );

  // Live accommodation subtotal (before tax)
  // Multiplied by nights so the guest can see the full stay cost.
  const accommodationSubtotal = SITE_CONFIG.rooms.reduce((sum, room) => {
    return sum + room.pricePerNight * getCount(room.sku) * Math.max(1, nights);
  }, 0);

  // ── NAVIGATION ───────────────────────────────────────────
  const handleContinue = () => {
    // ── OPTIONAL VALIDATION ─────────────────────────────────
    // Uncomment the block below if you want to require at least
    // one room before the guest can continue.
    //
    // if (totalRoomsSelected === 0) {
    //   setError("Please select at least one room to continue.");
    //   return;
    // }

    // Read the routing flag set by guests/page.tsx
    const isGroup = sessionStorage.getItem("isGroupBooking") === "true";

    if (isGroup) {
      // Full funnel: go to meeting rooms next
      router.push("/meeting-rooms");
    } else {
      // Short funnel: skip straight to the quote
      router.push("/quote");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-emerald-500 mb-1">
            Step 4 of 8
          </p>
          <h1 className="text-2xl font-bold text-stone-100">
            Choose your rooms
          </h1>
          {/* Show a summary of what the guest has told us so far */}
          <p className="text-stone-400 text-sm mt-1">
            {adults > 0 && `${adults} adult${adults !== 1 ? "s" : ""}`}
            {children > 0 && ` + ${children} child${children !== 1 ? "ren" : ""}`}
            {checkIn && checkOut && nights > 0 && (
              <> · {formatDate(checkIn)} → {formatDate(checkOut)} ({nights} night{nights !== 1 ? "s" : ""})</>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* ── PRICING NOTE ─────────────────────────────────────
            Reminds the guest that prices are per room per night
            and sets expectations before they see the numbers.
        ─────────────────────────────────────────────────────── */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg
                        px-5 py-4 mb-8 text-sm text-stone-400">
          <span className="text-stone-300 font-medium">Prices shown are per room, per night.</span>{" "}
          Select as many rooms as your group needs. Your coordinator will
          confirm exact room assignments and availability when they follow
          up on your quote.
        </div>

        {/* ── ROOM CARDS ───────────────────────────────────────
            One card per room in siteConfig.rooms.
            To add or remove rooms, edit siteConfig.ts only —
            no changes needed in this file.
        ─────────────────────────────────────────────────────── */}
        {SITE_CONFIG.rooms.length === 0 ? (
          // Fallback if siteConfig.rooms is accidentally left empty
          <div className="text-center py-20 text-stone-500">
            <p className="text-lg">No rooms configured.</p>
            <p className="text-sm mt-2">
              Add rooms to the rooms array in siteConfig.ts.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {SITE_CONFIG.rooms.map((room) => {
              const qty = getCount(room.sku);
              const isSelected = qty > 0;

              return (
                <div
                  key={room.sku}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-stone-900"
                      : "border-stone-800 bg-stone-900 hover:border-stone-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">

                    {/* ── ROOM PHOTO ──────────────────────────────────
                        Pulls from room.imageUrl in siteConfig.ts.
                        Shows a plain placeholder if the URL is missing
                        or broken — the card still works fine without it.
                    ─────────────────────────────────────────────────── */}
                    <div className="sm:w-52 sm:flex-shrink-0 h-48 sm:h-auto overflow-hidden">
                      {room.imageUrl ? (
                        <img
                          src={room.imageUrl}
                          alt={room.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, hide it gracefully
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

                    {/* ── ROOM DETAILS ─────────────────────────────────
                        Name, price, description, features, controls.
                    ─────────────────────────────────────────────────── */}
                    <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                      <div>
                        {/* Name and price on the same line */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-stone-100 leading-snug">
                            {room.name}
                          </h3>
                          <div className="text-right flex-shrink-0">
                            <div className="text-emerald-400 font-bold text-lg">
                              ${room.pricePerNight}
                            </div>
                            <div className="text-stone-500 text-xs">/ night</div>
                          </div>
                        </div>

                        {/* Description from siteConfig */}
                        <p className="text-stone-400 text-sm leading-relaxed mb-3">
                          {room.description}
                        </p>

                        {/* Feature pill tags */}
                        {room.features && room.features.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {room.features.map((feature, i) => (
                              <span
                                key={i}
                                className="text-xs bg-stone-800 border border-stone-700
                                           text-stone-400 rounded-full px-3 py-1"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ── QUANTITY CONTROLS ──────────────────────────
                          +/− buttons capped at room.maxQty.
                          The − button is disabled when qty is already 0.
                          The + button is disabled when qty hits maxQty.
                      ──────────────────────────────────────────────── */}
                      <div className="flex items-center justify-between pt-3
                                      border-t border-stone-800">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => adjustCount(room.sku, -1, room.maxQty)}
                            disabled={qty === 0}
                            className="w-9 h-9 rounded-full border border-stone-700
                                       text-stone-300 hover:bg-stone-800
                                       disabled:opacity-30 disabled:cursor-not-allowed
                                       text-lg font-bold flex items-center
                                       justify-center transition-colors"
                          >
                            −
                          </button>

                          <span className={`w-6 text-center font-bold text-lg ${
                            isSelected ? "text-emerald-400" : "text-stone-500"
                          }`}>
                            {qty}
                          </span>

                          <button
                            onClick={() => adjustCount(room.sku, 1, room.maxQty)}
                            disabled={qty >= room.maxQty}
                            className="w-9 h-9 rounded-full border border-stone-700
                                       text-stone-300 hover:bg-stone-800
                                       disabled:opacity-30 disabled:cursor-not-allowed
                                       text-lg font-bold flex items-center
                                       justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Per-room subtotal preview (only when qty > 0 and dates set) */}
                        {isSelected && nights > 0 && (
                          <div className="text-right text-sm">
                            <div className="text-stone-400">
                              {qty} × ${room.pricePerNight} × {nights} night{nights !== 1 ? "s" : ""}
                            </div>
                            <div className="text-emerald-400 font-semibold">
                              = ${(room.pricePerNight * qty * nights).toLocaleString()}
                            </div>
                          </div>
                        )}

                        {/* When no dates set yet, show simpler per-night preview */}
                        {isSelected && nights === 0 && (
                          <div className="text-right text-sm text-stone-400">
                            {qty} room{qty !== 1 ? "s" : ""} · dates not set
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── RUNNING TOTAL ────────────────────────────────────
            Shows the accommodation subtotal as a sticky summary.
            Only appears once at least one room is selected.
        ─────────────────────────────────────────────────────── */}
        {totalRoomsSelected > 0 && (
          <div className="mt-6 bg-stone-900 border border-emerald-800 rounded-xl
                          px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-stone-400">
                {totalRoomsSelected} room{totalRoomsSelected !== 1 ? "s" : ""} selected
              </div>
              {nights > 0 && (
                <div className="text-xs text-stone-500 mt-0.5">
                  {nights} night{nights !== 1 ? "s" : ""} · before tax
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold text-xl">
                {nights > 0
                  ? `$${accommodationSubtotal.toLocaleString()}`
                  : `$${SITE_CONFIG.rooms.reduce((s, r) => s + r.pricePerNight * getCount(r.sku), 0).toLocaleString()} /night`
                }
              </div>
              <div className="text-stone-500 text-xs">accommodation subtotal</div>
            </div>
          </div>
        )}

        {/* Error message (if validation is enabled above) */}
        {error && (
          <div className="mt-4 text-red-400 text-sm bg-red-950 border
                          border-red-800 rounded-lg px-4 py-3">
            {error}
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
            {totalRoomsSelected > 0
              ? `Continue with ${totalRoomsSelected} room${totalRoomsSelected !== 1 ? "s" : ""} →`
              : "Continue →"}
          </button>
        </div>

        {/* Helpful note about what comes next */}
        <p className="text-center text-stone-600 text-xs mt-4">
          {sessionStorage.getItem("isGroupBooking") === "true"
            ? "Next: meeting rooms — then meals and activities."
            : "Next: your quote summary."}
        </p>

      </div>
    </div>
  );
}
