// ============================================================
//  store.ts — THE MEMORY THAT CARRIES GUEST CHOICES FORWARD
// ============================================================
//
//  This file is the "short-term memory" of the booking funnel.
//  As a guest moves from step to step, every choice they make
//  is saved here and available to every other page.
//
//  HOW IT WORKS
//  ─────────────
//  This uses a library called Zustand (a simple state manager).
//  Think of it like a shared clipboard that all pages can read
//  from and write to.
//
//  When a guest selects rooms on the Rooms page, those choices
//  are written here. When the Invoice page loads, it reads from
//  here to build the quote. Nothing is lost between steps.
//
//  DO YOU NEED TO EDIT THIS FILE?
//  ────────────────────────────────
//  Most venues will NOT need to change this file at all.
//  Everything guests can choose is already tracked here.
//
//  Only edit this file if you want to:
//    • Add a completely new type of booking item
//      (e.g., "parking spots", "boat slips", "RV hookups")
//    • Remove a category entirely
//      (e.g., if your venue has no activities or no meals)
//
//  AI CUSTOMIZATION TIP
//  ─────────────────────
//  If you ask an AI to add a new booking category, say:
//  "Add a [parking] field to store.ts following the same
//  pattern as roomCounts. It should be Record<string, number>
//  and default to an empty object {}."
//
// ============================================================

import { create } from "zustand";

// ─────────────────────────────────────────────────────────
//  TYPE DEFINITION
//  This describes the shape of ALL data the funnel tracks.
//  Every field here is something a guest can choose or that
//  the funnel calculates and passes between pages.
// ─────────────────────────────────────────────────────────
interface BookingState {

  // ── STEP 1: WHO IS THIS GROUP? ──────────────────────────
  // The broad category: "Group Retreat", "Wedding", etc.
  // Set on the Segment page (app/page.tsx)
  segment: string;

  // The specific type within that segment: "Church / Faith-based", etc.
  // Set on the Event Type page (app/event-type/page.tsx)
  // Left empty "" for Individual Guests who skip that step.
  eventType: string;

  // ── STEP 2: HOW MANY PEOPLE? ────────────────────────────
  // Number of adults attending. This number drives most pricing.
  adults: number;

  // Number of children attending (used for kids meal pricing).
  children: number;

  // Average age of the children in the group.
  // Used to calculate age-based kids meal pricing (rate × age).
  childrenAvgAge: number;

  // ── STEP 3: WHEN ARE THEY COMING? ───────────────────────
  // Check-in and check-out dates, stored as strings (YYYY-MM-DD)
  // or empty string "" if not yet selected.
  checkIn: string;
  checkOut: string;

  // ── STEP 4: WHICH ROOMS? ────────────────────────────────
  // A dictionary of { roomSku: quantity } pairs.
  // Example: { "standard1queen": 3, "couplessuite": 1 }
  // When a guest sets a room to 0, it's still stored — just not charged.
  // The Invoice page filters out any rooms with quantity 0.
  roomCounts: Record<string, number>;

  // ── STEP 5: WHICH MEETING ROOMS? ────────────────────────
  // Same pattern as roomCounts but for meeting rooms.
  // Example: { "manitobaroom": 1, "pinawaroom": 1 }
  // Only shown to groups at or above the groupMinimum threshold.
  // Groups below that threshold skip this step entirely and this
  // stays as an empty object {}.
  meetingRoomCounts: Record<string, number>;

  // ── STEP 6: WHICH MEALS? ────────────────────────────────
  // Tracks which meal types the group wants, per day.
  // This is an object where keys are meal identifiers and values
  // are booleans (true = selected) or numbers (e.g., quantity).
  // The Meals page writes to this; the Invoice page reads from it.
  // Only shown to groups at or above the groupMinimum threshold.
  selectedMeals: Record<string, boolean>;

  // ── STEP 7: WHICH ACTIVITIES? ───────────────────────────
  // Tracks selected activity SKUs and participant counts.
  // Example: { "canoe-vote": 12, "paint-night": 20 }
  // A value of 0 means not selected.
  activityCounts: Record<string, number>;

  // ── STEP 8: CONTACT DETAILS ─────────────────────────────
  // Collected on the final Contact page before sending the quote.
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactNotes: string; // Any additional info the guest wants to share

  // ─────────────────────────────────────────────────────────
  //  ACTIONS
  //  These are the functions that other pages use to UPDATE
  //  the state. Each page imports the ones it needs.
  //
  //  Naming convention: set[FieldName]
  // ─────────────────────────────────────────────────────────
  setSegment: (segment: string) => void;
  setEventType: (eventType: string) => void;
  setAdults: (adults: number) => void;
  setChildren: (children: number) => void;
  setChildrenAvgAge: (age: number) => void;
  setCheckIn: (date: string) => void;
  setCheckOut: (date: string) => void;

  // Updates a single room's quantity. Merges with existing counts.
  // Usage: setRoomCount("standard1queen", 3)
  setRoomCount: (sku: string, count: number) => void;

  // Updates a single meeting room's quantity. Same merge pattern.
  // Usage: setMeetingRoomCount("manitobaroom", 1)
  setMeetingRoomCount: (sku: string, count: number) => void;

  // Replaces the entire selectedMeals object at once.
  // The Meals page builds the full object then calls this once.
  setSelectedMeals: (meals: Record<string, boolean>) => void;

  // Updates a single activity's participant count.
  // Usage: setActivityCount("canoe-vote", 12)
  setActivityCount: (sku: string, count: number) => void;

  setContactName: (name: string) => void;
  setContactEmail: (email: string) => void;
  setContactPhone: (phone: string) => void;
  setContactNotes: (notes: string) => void;

  // Resets the ENTIRE booking back to a blank state.
  // Called when a guest clicks "Start Over" on the invoice page.
  resetBooking: () => void;
}

// ─────────────────────────────────────────────────────────
//  DEFAULT / INITIAL STATE
//  These are the starting values before a guest makes any
//  choices. Strings start as "", numbers as 0, objects as {}.
// ─────────────────────────────────────────────────────────
const defaultState = {
  segment: "",
  eventType: "",
  adults: 0,
  children: 0,
  childrenAvgAge: 0,
  checkIn: "",
  checkOut: "",
  roomCounts: {},
  meetingRoomCounts: {},   // Added: tracks which meeting rooms are booked
  selectedMeals: {},
  activityCounts: {},
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactNotes: "",
};

// ─────────────────────────────────────────────────────────
//  THE STORE
//  create() builds the actual Zustand store. The (set) function
//  is how you update a value — it merges your changes with the
//  existing state (like Object.assign), so you only need to
//  specify what changed.
// ─────────────────────────────────────────────────────────
export const useBookingStore = create<BookingState>((set) => ({

  // Spread in all the default values defined above
  ...defaultState,

  // ── SETTERS ─────────────────────────────────────────────
  // Each setter takes a new value and writes it to the store.

  setSegment: (segment) => set({ segment }),

  setEventType: (eventType) => set({ eventType }),

  setAdults: (adults) => set({ adults }),

  setChildren: (children) => set({ children }),

  setChildrenAvgAge: (childrenAvgAge) => set({ childrenAvgAge }),

  setCheckIn: (checkIn) => set({ checkIn }),

  setCheckOut: (checkOut) => set({ checkOut }),

  // For room counts, we merge the new SKU+quantity into the
  // existing object rather than replacing it. This means
  // setting one room doesn't wipe out another room's selection.
  setRoomCount: (sku, count) =>
    set((state) => ({
      roomCounts: { ...state.roomCounts, [sku]: count },
    })),

  // Same merge pattern for meeting rooms.
  setMeetingRoomCount: (sku, count) =>
    set((state) => ({
      meetingRoomCounts: { ...state.meetingRoomCounts, [sku]: count },
    })),

  // Meals replaces the whole object since the Meals page
  // builds the complete selection in one go.
  setSelectedMeals: (selectedMeals) => set({ selectedMeals }),

  // Activity counts use the same merge pattern as rooms.
  setActivityCount: (sku, count) =>
    set((state) => ({
      activityCounts: { ...state.activityCounts, [sku]: count },
    })),

  setContactName: (contactName) => set({ contactName }),

  setContactEmail: (contactEmail) => set({ contactEmail }),

  setContactPhone: (contactPhone) => set({ contactPhone }),

  setContactNotes: (contactNotes) => set({ contactNotes }),

  // Reset wipes everything back to the defaults defined above.
  // Spreading defaultState is safer than listing fields manually —
  // if you ever add a new field, it gets reset automatically too.
  resetBooking: () => set({ ...defaultState }),

}));
// Alias for any older pages that haven't been updated yet
export const useFunnelStore = useBookingStore;
