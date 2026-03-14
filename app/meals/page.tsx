// ============================================================
//  app/meals/page.tsx — STEP: PLAN YOUR MEALS
// ============================================================
//
//  This page is ONLY shown to groups at or above the
//  groupMinimum threshold set in siteConfig.ts (default: 20).
//  Smaller groups are routed around it automatically.
//
//  WHAT THIS PAGE DOES
//  ────────────────────
//  Lets the group planner choose which meals they want on
//  each day of their stay. The page builds a day-by-day
//  meal planner automatically from the check-in/check-out
//  dates stored in the Zustand store.
//
//  For each day it shows:
//    • Which meals are available (Breakfast, Lunch, Supper,
//      Night Snack, Nutrition Break)
//    • The per-person cost for each meal
//    • A checkbox to select/deselect each meal
//    • A running daily and total cost preview
//
//  PRICING MODEL (from siteConfig.meals)
//  ───────────────────────────────────────
//  Adults:
//    Each meal type has a flat per-person rate.
//    e.g. Breakfast: $16.50/adult × 35 adults = $577.50
//
//  Children (age-based):
//    cost per meal = childMealRatePerYear × avgAge × numChildren
//    e.g. $1.50 × 8 years × 10 kids = $120.00 per meal
//
//  Night Snack for kids:
//    cost = childNightSnackRate × avgAge × numChildren
//    e.g. $0.25 × 8 years × 10 kids = $20.00 per snack
//
//  WHY AGE-BASED KIDS PRICING?
//  ─────────────────────────────
//  A 12-year-old eats more than a 4-year-old. This model
//  scales cost fairly based on the average age entered in
//  the Guests step. If your venue uses a flat kids rate
//  instead, set childMealRatePerYear to your flat price and
//  set childrenAvgAge to 1 — the math still works.
//
//  MEAL AVAILABILITY BY DAY
//  ─────────────────────────
//  • Arrival day:   Supper + Night Snack only
//                   (guests arrive during the day, miss breakfast/lunch)
//  • Middle days:   All meals available
//  • Departure day: Breakfast + Nutrition Break only
//                   (guests leave before/at lunch)
//
//  This is the Wilderness Edge model. To change which meals
//  appear on which days, edit the getMealsForDay() function
//  in this file.
//
//  GUARD CLAUSE
//  ─────────────
//  Like meeting-rooms/page.tsx, this page redirects to home
//  if accessed directly without the isGroupBooking flag.
//
//  CUSTOMIZATION TIPS
//  ───────────────────
//  • To change meal prices: edit siteConfig.meals only.
//  • To rename meal types (e.g. "Dinner" instead of "Supper"):
//    update the MEAL_CONFIG labels in this file.
//  • To add a new meal type (e.g. "Afternoon Tea"): add it to
//    MEAL_CONFIG below and include it in getMealsForDay().
//  • To use a flat kids price: set childMealRatePerYear to your
//    flat price and note this in the UI text below.
//  • To disable kids meals: set children to 0 in guests/page.tsx
//    or hide the children input there.
//
// ============================================================

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "../store";
import { SITE_CONFIG } from "../siteConfig";

// ── MEAL CONFIGURATION ───────────────────────────────────────
// Defines all possible meal types with their display labels,
// which price field to use from siteConfig.meals, and an icon.
//
// To rename a meal: change the label field.
// To add a meal: add a new entry and include it in getMealsForDay().
// To remove a meal: delete its entry and remove it from getMealsForDay().
const MEAL_CONFIG = [
  {
    key: "breakfast",
    label: "Breakfast",
    icon: "🌅",
    adultPrice: SITE_CONFIG.meals.adultBreakfastPrice,
    description: "Hot breakfast buffet",
  },
  {
    key: "lunch",
    label: "Lunch",
    icon: "☀️",
    adultPrice: SITE_CONFIG.meals.adultLunchPrice,
    description: "Lunch buffet",
  },
  {
    key: "supper",
    label: "Supper",
    icon: "🍽️",
    adultPrice: SITE_CONFIG.meals.adultSupperPrice,
    description: "Chef's choice supper buffet",
  },
  {
    key: "nightsnack",
    label: "Night Snack",
    icon: "🍪",
    adultPrice: SITE_CONFIG.meals.nightSnackPrice,
    description: "Cookies & fresh fruit basket",
  },
  {
    key: "nutritionbreak",
    label: "Nutrition Break",
    icon: "☕",
    adultPrice: SITE_CONFIG.meals.nutritionBreakPrice,
    description: "Coffee, tea & light snack between sessions",
  },
];

// ── MEAL AVAILABILITY BY DAY ─────────────────────────────────
// Returns which meal keys are available for a given day type.
// Edit this function to match your venue's service schedule.
//
//   "arrival"   — the check-in day
//   "middle"    — days between check-in and check-out
//   "departure" — the check-out day
//
// Wilderness Edge model:
//   Arrival:   supper + night snack (guests miss breakfast/lunch)
//   Middle:    all meals
//   Departure: breakfast + nutrition break (guests leave before lunch)
const getMealsForDay = (dayType: "arrival" | "middle" | "departure") => {
  switch (dayType) {
    case "arrival":
      return ["supper", "nightsnack"];
    case "middle":
      return ["breakfast", "lunch", "supper", "nightsnack", "nutritionbreak"];
    case "departure":
      return ["breakfast", "nutritionbreak"];
    default:
      return [];
  }
};

// ── TYPES ────────────────────────────────────────────────────
interface DayMeals {
  date: string;         // YYYY-MM-DD
  label: string;        // "Day 1 — Arrival", "Day 2 — Tuesday Jun 18", etc.
  dayType: "arrival" | "middle" | "departure";
  availableMeals: string[]; // meal keys available this day
}

export default function MealsPage() {
  const router = useRouter();

  // ── GUARD CLAUSE ─────────────────────────────────────────
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem("isGroupBooking");
    if (flag !== "true") {
      router.replace("/");
    } else {
      setIsAllowed(true);
    }
  }, [router]);

  // ── STORE ────────────────────────────────────────────────
  const adults = useBookingStore((s) => s.adults);
  const children = useBookingStore((s) => s.children);
  const childrenAvgAge = useBookingStore((s) => s.childrenAvgAge);
  const checkIn = useBookingStore((s) => s.checkIn);
  const checkOut = useBookingStore((s) => s.checkOut);
  const storedMeals = useBookingStore((s) => s.selectedMeals);
  const setSelectedMeals = useBookingStore((s) => s.setSelectedMeals);

  // ── LOCAL STATE ──────────────────────────────────────────
  // selectedMeals is a flat map of "YYYY-MM-DD_mealkey" → boolean
  // e.g. { "2025-06-14_supper": true, "2025-06-14_nightsnack": true }
  // This flat structure makes it easy to read in the quote page.
  const [selectedMeals, setLocalMeals] = useState<Record<string, boolean>>(
    storedMeals || {}
  );

  // ── BUILD DAY LIST ───────────────────────────────────────
  // Generate one DayMeals entry for each day of the stay.
  // This runs whenever check-in or check-out changes.
  const days = useMemo<DayMeals[]>(() => {
    if (!checkIn || !checkOut) return [];

    const result: DayMeals[] = [];
    const start = new Date(checkIn + "T00:00:00");
    const end = new Date(checkOut + "T00:00:00");
    const totalDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (totalDays <= 0) return [];

    // We show a meal day for each night of the stay, plus departure day.
    // e.g. 3-night stay → arrival, middle, middle, departure = 4 rows
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      let dayType: "arrival" | "middle" | "departure";
      if (i === 0) dayType = "arrival";
      else if (i === totalDays) dayType = "departure";
      else dayType = "middle";

      // Format a readable label for this day
      const dayName = date.toLocaleDateString("en-CA", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      const dayLabel =
        dayType === "arrival"
          ? `Day 1 — Arrival · ${dayName}`
          : dayType === "departure"
          ? `Day ${i + 1} — Departure · ${dayName}`
          : `Day ${i + 1} — ${dayName}`;

      result.push({
        date: dateStr,
        label: dayLabel,
        dayType,
        availableMeals: getMealsForDay(dayType),
      });
    }

    return result;
  }, [checkIn, checkOut]);

  // ── PRICING HELPERS ──────────────────────────────────────

  // Calculate the cost of a single meal for the whole group.
  // Handles both adult flat pricing and age-based kids pricing.
  const getMealCost = (mealKey: string): number => {
    const meal = MEAL_CONFIG.find((m) => m.key === mealKey);
    if (!meal) return 0;

    // Adult cost: flat rate × number of adults
    const adultCost = meal.adultPrice * adults;

    // Kids cost: age-based rate × average age × number of children
    // For night snack, kids use a different (lower) rate.
    let kidsCost = 0;
    if (children > 0 && childrenAvgAge > 0) {
      if (mealKey === "nightsnack") {
        kidsCost =
          SITE_CONFIG.meals.childNightSnackRate * childrenAvgAge * children;
      } else {
        kidsCost =
          SITE_CONFIG.meals.childMealRatePerYear * childrenAvgAge * children;
      }
    }

    return adultCost + kidsCost;
  };

  // Toggle a single meal checkbox on/off
  const toggleMeal = (dateStr: string, mealKey: string) => {
    const storeKey = `${dateStr}_${mealKey}`;
    const updated = {
      ...selectedMeals,
      [storeKey]: !selectedMeals[storeKey],
    };
    setLocalMeals(updated);
    setSelectedMeals(updated);
  };

  // Check if a meal is selected
  const isSelected = (dateStr: string, mealKey: string) =>
    !!selectedMeals[`${dateStr}_${mealKey}`];

  // Select or deselect all meals for an entire day at once
  const toggleDay = (day: DayMeals, selectAll: boolean) => {
    const updated = { ...selectedMeals };
    for (const mealKey of day.availableMeals) {
      updated[`${day.date}_${mealKey}`] = selectAll;
    }
    setLocalMeals(updated);
    setSelectedMeals(updated);
  };

  // Calculate the total cost for a single day's selected meals
  const getDayTotal = (day: DayMeals): number => {
    return day.availableMeals.reduce((sum, mealKey) => {
      if (isSelected(day.date, mealKey)) {
        return sum + getMealCost(mealKey);
      }
      return sum;
    }, 0);
  };

  // Grand total across all days and meals
  const grandTotal = days.reduce((sum, day) => sum + getDayTotal(day), 0);

  // Total number of meal selections made
  const totalSelectionsCount = Object.values(selectedMeals).filter(Boolean).length;

  // ── NAVIGATION ───────────────────────────────────────────
  const handleContinue = () => {
    // Meals are optional — groups can proceed with none selected
    router.push("/activities");
  };

  // ── RENDER GUARD ─────────────────────────────────────────
  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-500 text-sm">Checking access...</div>
      </div>
    );
  }

  // ── NO DATES SET ─────────────────────────────────────────
  if (days.length === 0) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center
                      justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-stone-400 mb-4">
            Dates haven't been set yet. Please go back and select your
            check-in and check-out dates before planning meals.
          </p>
          <button
            onClick={() => router.push("/dates")}
            className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500
                       text-white font-semibold transition-colors"
          >
            ← Set dates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-emerald-500 mb-1">
            Step 6 of 8
          </p>
          <h1 className="text-2xl font-bold text-stone-100">
            Plan your meals
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {adults} adult{adults !== 1 ? "s" : ""}
            {children > 0 && ` + ${children} children (avg age ${childrenAvgAge})`}
            {" · "}{days.length} day{days.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── INTRO NOTE ───────────────────────────────────────
            Explains the pricing model so there are no surprises.
        ─────────────────────────────────────────────────────── */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg
                        px-5 py-4 mb-6 text-sm text-stone-400 space-y-1">
          <p>
            <span className="text-stone-300 font-medium">Meals are optional.</span>{" "}
            Check the meals your group would like included each day.
            Prices are estimated — your coordinator will confirm final
            catering costs when they follow up on your quote.
          </p>
          {children > 0 && (
            <p className="text-stone-500 text-xs pt-1">
              Kids pricing: ${SITE_CONFIG.meals.childMealRatePerYear.toFixed(2)} × age × {children} children per meal.
              Night snack: ${SITE_CONFIG.meals.childNightSnackRate.toFixed(2)} × age × {children} children.
            </p>
          )}
        </div>

        {/* ── DAY-BY-DAY MEAL PLANNER ──────────────────────────
            One collapsible section per day of the stay.
            Each day shows only the meals available for that
            day type (arrival / middle / departure).
        ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {days.map((day) => {
            const dayTotal = getDayTotal(day);
            const allSelected = day.availableMeals.every((m) =>
              isSelected(day.date, m)
            );
            const noneSelected = day.availableMeals.every(
              (m) => !isSelected(day.date, m)
            );

            return (
              <div
                key={day.date}
                className="bg-stone-900 border border-stone-800 rounded-xl
                           overflow-hidden"
              >
                {/* Day header */}
                <div className="flex items-center justify-between px-5 py-4
                                border-b border-stone-800">
                  <div>
                    <div className="font-semibold text-stone-100 text-sm">
                      {day.label}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {day.availableMeals.length} meal{day.availableMeals.length !== 1 ? "s" : ""} available this day
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Day total */}
                    {dayTotal > 0 && (
                      <div className="text-emerald-400 font-semibold text-sm">
                        ${dayTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    )}
                    {/* Select all / clear all toggle for this day */}
                    <button
                      onClick={() => toggleDay(day, noneSelected || !allSelected)}
                      className="text-xs text-stone-500 hover:text-emerald-400
                                 underline transition-colors"
                    >
                      {allSelected ? "Clear all" : "Select all"}
                    </button>
                  </div>
                </div>

                {/* Meal checkboxes for this day */}
                <div className="divide-y divide-stone-800">
                  {day.availableMeals.map((mealKey) => {
                    const meal = MEAL_CONFIG.find((m) => m.key === mealKey);
                    if (!meal) return null;

                    const checked = isSelected(day.date, mealKey);
                    const mealCost = getMealCost(mealKey);

                    return (
                      <label
                        key={mealKey}
                        className={`flex items-center justify-between px-5 py-3.5
                                    cursor-pointer transition-colors ${
                          checked
                            ? "bg-emerald-950/40"
                            : "hover:bg-stone-800/50"
                        }`}
                      >
                        {/* Checkbox + meal info */}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMeal(day.date, mealKey)}
                            className="w-4 h-4 rounded accent-emerald-500
                                       cursor-pointer"
                          />
                          <span className="text-lg">{meal.icon}</span>
                          <div>
                            <div className={`text-sm font-medium ${
                              checked ? "text-stone-100" : "text-stone-300"
                            }`}>
                              {meal.label}
                            </div>
                            <div className="text-xs text-stone-500">
                              {meal.description}
                            </div>
                          </div>
                        </div>

                        {/* Per-meal cost breakdown */}
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className={`text-sm font-semibold ${
                            checked ? "text-emerald-400" : "text-stone-500"
                          }`}>
                            ${mealCost.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          {/* Breakdown hint */}
                          <div className="text-xs text-stone-600">
                            {adults} × ${meal.adultPrice.toFixed(2)}
                            {children > 0 && (
                              <> + kids</>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── GRAND TOTAL ──────────────────────────────────────
            Shows total meals cost across all days.
            Only visible once at least one meal is selected.
        ─────────────────────────────────────────────────────── */}
        {totalSelectionsCount > 0 && (
          <div className="mt-6 bg-stone-900 border border-emerald-800 rounded-xl
                          px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-stone-400">
                {totalSelectionsCount} meal service{totalSelectionsCount !== 1 ? "s" : ""} selected
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {adults} adult{adults !== 1 ? "s" : ""}
                {children > 0 && ` + ${children} children`}
                {" · "}before tax
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold text-xl">
                ${grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-stone-500 text-xs">meals subtotal</div>
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
            {totalSelectionsCount > 0
              ? "Continue to activities →"
              : "Continue without meals →"}
          </button>
        </div>

        <p className="text-center text-stone-600 text-xs mt-4">
          Next: optional activities — then your full quote.
        </p>

      </div>
    </div>
  );
}
