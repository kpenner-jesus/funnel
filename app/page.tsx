// ============================================================
//  app/page.tsx — STEP 1: CHOOSE YOUR EVENT SEGMENT
// ============================================================
//
//  This is the first page guests see. It asks the most
//  fundamental question: what kind of event is this?
//
//  WHAT THIS PAGE DOES
//  ────────────────────
//  Displays a card for each segment defined in
//  siteConfig.eventSegments. When a guest picks one:
//
//    • If the segment has event types (e.g. "Group Retreat"
//      has Church, Corporate, Youth...) → go to /event-type
//
//    • If the segment has NO event types (e.g. "Individual
//      Guest") → skip /event-type and go straight to /guests
//
//  This is the entry point to the entire funnel. Everything
//  the guest does from here is tracked in the Zustand store.
//
//  CUSTOMIZATION TIPS
//  ───────────────────
//  • To add or remove segments: edit siteConfig.eventSegments
//  • To change the hero image: update heroImageUrl in siteConfig
//  • To skip segment selection entirely (one venue type only):
//    remove the cards and call setSegment() with a fixed value
//    then router.push("/guests") directly on page load
//
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useBookingStore } from "./store";
import { SITE_CONFIG } from "./siteConfig";

export default function HomePage() {
  const router = useRouter();

  // ── STORE ────────────────────────────────────────────────
  const setSegment   = useBookingStore((s) => s.setSegment);
  const setEventType = useBookingStore((s) => s.setEventType);

  // ── SEGMENT SELECTION ────────────────────────────────────
  const handleSegmentSelect = (segmentName: string) => {
    setSegment(segmentName);
    setEventType(""); // Clear any previously selected event type

    // Find the segment config to check if it has sub-types
    const segmentConfig = SITE_CONFIG.eventSegments.find(
      (s) => s.name === segmentName
    );

    if (segmentConfig && segmentConfig.types.length > 0) {
      // Has sub-types → go to event type selector
      router.push("/event-type");
    } else {
      // No sub-types (e.g. Individual Guest) → skip to guests
      router.push("/guests");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {SITE_CONFIG.heroImageUrl && (
          <img
            src={SITE_CONFIG.heroImageUrl}
            alt={SITE_CONFIG.venueName}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40
                        to-stone-950/80" />

        {/* Venue name and tagline over the hero */}
        <div className="absolute inset-0 flex flex-col items-center
                        justify-center text-center px-6">
          {SITE_CONFIG.venueLogo && (
            <img
              src={SITE_CONFIG.venueLogo}
              alt={SITE_CONFIG.venueName}
              className="h-12 w-auto object-contain mb-3 drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {SITE_CONFIG.venueName}
          </h1>
          {SITE_CONFIG.venueTagline && (
            <p className="text-stone-300 text-sm mt-1 drop-shadow">
              {SITE_CONFIG.venueTagline}
            </p>
          )}
        </div>
      </div>

      {/* ── SEGMENT SELECTION ────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-6 py-10">

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-stone-100">
            What brings you to {SITE_CONFIG.venueName.split(" ")[0]}?
          </h2>
          <p className="text-stone-400 text-sm mt-2">
            Select the option that best describes your visit.
            We will tailor your quote accordingly.
          </p>
        </div>

        {/* ── SEGMENT CARDS ──────────────────────────────────────
            One card per segment in siteConfig.eventSegments.
            To add or remove segments, edit siteConfig.ts only.
        ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {SITE_CONFIG.eventSegments.map((segment) => (
            <button
              key={segment.name}
              onClick={() => handleSegmentSelect(segment.name)}
              className="w-full text-left px-5 py-4 rounded-xl border
                         border-stone-700 bg-stone-900 hover:border-emerald-600
                         hover:bg-stone-800 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-100 group-hover:text-emerald-400
                                  transition-colors">
                    {segment.name}
                  </div>
                  {segment.desc && (
                    <div className="text-stone-500 text-sm mt-0.5">
                      {segment.desc}
                    </div>
                  )}
                </div>
                <div className="text-stone-600 group-hover:text-emerald-500
                                transition-colors text-lg">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── VENUE CONTACT FOOTER ─────────────────────────────── */}
        <div className="mt-10 text-center text-stone-600 text-xs space-y-1">
          <p>Questions? We are happy to help.</p>
          <p>
            
              href={`tel:${SITE_CONFIG.venuePhone}`}
              className="hover:text-emerald-500 transition-colors"
            >
              {SITE_CONFIG.venuePhone}
            </a>
            {" · "}
            
              href={`mailto:${SITE_CONFIG.venueEmail}`}
              className="hover:text-emerald-500 transition-colors"
            >
              {SITE_CONFIG.venueEmail}
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
