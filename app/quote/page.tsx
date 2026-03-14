"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";

export default function QuoteStep() {
  const router = useRouter();
  const { data, reset } = useFunnelStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);
  if (!isLoaded) return null;

  // 1. Logic: Date/Nights Calculation
  let nights = 1;
  if (data.dateRange?.from && data.dateRange?.to) {
    const start = new Date(data.dateRange.from);
    const end = new Date(data.dateRange.to);
    nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // 2. Logic: Room Totals
  const roomRates: Record<string, number> = { "Bachelor Suite": 89, "Couples Suite": 119, "Family Suite": 139, "Two-Bedroom Suite": 159 };
  let roomsSubtotal = 0;
  Object.entries(data.roomCounts || {}).forEach(([room, qty]) => {
    roomsSubtotal += (roomRates[room] || 0) * qty * nights;
  });

  // 3. Logic: Meal Totals
  let adultMealTotal = 0;
  let childMealTotal = 0;
  if (data.wantsMeals) {
    let totalB = 1, totalL = 1, totalS = 1; // Simplification for demo logic
    const totalMealsPerPerson = (nights * 3); // Approx schedule
    adultMealTotal = (data.adultCount || 0) * ((totalMealsPerPerson / 3) * (16.50 + 21.99 + 23.99));
    const costPerChildMeal = 1.50 * (data.childAge || 5);
    childMealTotal = (data.childCount || 0) * costPerChildMeal * totalMealsPerPerson;
  }

  // 4. Logic: Activities Totals
  const actRates: Record<string, number> = { "Canoe Rental": 25, "Tubing & Rafting": 15, "Pontoon Boat Experience": 150, "Hoopla Island Obstacle": 20, "Bannock Bake Activity": 10, "Firepit with S'mores": 5, "Wolf Howl Hike (Guided)": 12, "Petroforms Guided Tour": 15 };
  let activitiesSubtotal = 0;
  Object.entries(data.activities || {}).forEach(([name, qty]) => {
    activitiesSubtotal += (actRates[name] || 0) * qty;
  });

  // 5. Final Taxes (Manitoba: 5% GST, 7% PST)
  const subtotal = roomsSubtotal + adultMealTotal + childMealTotal + activitiesSubtotal;
  const gst = subtotal * 0.05;
  const pst = subtotal * 0.07;
  const grandTotal = subtotal + gst + pst;

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-2xl border border-stone-200">
        <div className="text-center border-b border-stone-100 pb-8 mb-8">
          <h1 className="text-4xl font-black text-stone-900 mb-2">Estimate Summary</h1>
          <p className="text-stone-500 font-medium tracking-wide uppercase text-sm">Wilderness Edge Retreat & Conference Centre</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="font-bold text-stone-400 uppercase text-xs tracking-widest">Lodging & Catering</h3>
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-2">
              <div className="flex justify-between"><span>Rooms ({nights} nights)</span><span className="font-bold">${roomsSubtotal.toFixed(2)}</span></div>
              {data.wantsMeals && (
                <>
                  <div className="flex justify-between text-sm"><span>Adult Meals</span><span>${adultMealTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span>Child Meals (Age {data.childAge})</span><span>${childMealTotal.toFixed(2)}</span></div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-stone-400 uppercase text-xs tracking-widest">Selected Activities</h3>
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-2">
              {Object.entries(data.activities || {}).filter(([_, q]) => q > 0).map(([n, q]) => (
                <div key={n} className="flex justify-between text-sm text-emerald-900">
                  <span>{q}x {n}</span>
                  <span>${(actRates[n] * q).toFixed(2)}</span>
                </div>
              ))}
              {activitiesSubtotal === 0 && <p className="text-stone-400 text-sm italic">No activities selected.</p>}
            </div>
          </div>
        </div>

        <div className="bg-stone-900 rounded-3xl p-8 text-white shadow-xl">
          <div className="space-y-3 border-b border-stone-700 pb-5 mb-5">
            <div className="flex justify-between text-stone-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-stone-400 text-sm"><span>GST (5%)</span><span>${gst.toFixed(2)}</span></div>
            <div className="flex justify-between text-stone-400 text-sm"><span>PST (7%)</span><span>${pst.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total Estimate</span>
            <span className="text-4xl font-black text-emerald-400">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
  onClick={() => router.push("/contact")}
  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg transition text-xl mb-4"
>
  Request Official Invoice
</button>
        </div>
      </div>
    </div>
  );
}