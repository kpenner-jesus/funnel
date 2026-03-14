"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";

export default function MealsStep() {
  const router = useRouter();
  const { data, setData } = useFunnelStore();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State for the configuration panel
  const [wantsMeals, setWantsMeals] = useState<boolean | null>(null);
  const [firstMeal, setFirstMeal] = useState("Supper");
  const [lastMeal, setLastMeal] = useState("Lunch");
  const [childAge, setChildAge] = useState(5);

  const totalGuests = (data.adultCount || 1) + (data.childCount || 0);
  const hasKids = (data.childCount || 0) > 0;

  useEffect(() => {
    setIsLoaded(true);
    if (totalGuests < 20) {
      setData({ wantsMeals: false });
      router.push("/activities");
    }
  }, [totalGuests, router, setData]);

  if (!isLoaded || totalGuests < 20) return null;

  const handleNext = () => {
    setData({ wantsMeals, firstMeal, lastMeal, childAge });
    router.push("/activities");
  };

  const handleNoThanks = () => {
    setData({ wantsMeals: false });
    router.push("/activities");
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans pt-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white shadow-xl rounded-3xl p-8 border border-stone-200 text-center">
          <h1 className="text-3xl font-extrabold text-stone-900 mb-4">Add a Meal Plan?</h1>
          <p className="text-stone-500 mb-8">Your group qualifies for our full catering service.</p>
          
          {wantsMeals === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => setWantsMeals(true)} className="p-8 border-2 border-emerald-100 bg-emerald-50 rounded-2xl hover:border-emerald-600 hover:shadow-md transition">
                <span className="block text-2xl font-bold text-emerald-900 mb-2">Yes, Please</span>
              </button>
              <button onClick={handleNoThanks} className="p-8 border-2 border-stone-200 rounded-2xl hover:border-stone-400 hover:shadow-md transition">
                <span className="block text-2xl font-bold text-stone-700 mb-2">No Thanks</span>
              </button>
            </div>
          ) : (
            <div className="text-left space-y-6 fade-in">
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <label className="block font-bold text-stone-800 mb-2">Check-in Day (First Meal)</label>
                <select value={firstMeal} onChange={(e) => setFirstMeal(e.target.value)} className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none">
                  <option value="Supper">Start with Supper</option>
                  <option value="None">No meals on Check-in day</option>
                </select>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <label className="block font-bold text-stone-800 mb-2">Check-out Day (Last Meal)</label>
                <select value={lastMeal} onChange={(e) => setLastMeal(e.target.value)} className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none">
                  <option value="Breakfast">Breakfast Only</option>
                  <option value="Lunch">Breakfast & Lunch</option>
                </select>
              </div>

              {hasKids && (
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                  <label className="block font-bold text-emerald-900 mb-2">Average Age of Children (1-10)</label>
                  <p className="text-sm text-emerald-700 mb-4">Kids meal pricing scales based on average age.</p>
                  <select value={childAge} onChange={(e) => setChildAge(Number(e.target.value))} className="w-full p-4 rounded-xl border-2 border-emerald-200 outline-none">
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} years old</option>
                    ))}
                  </select>
                </div>
              )}

              <button onClick={handleNext} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg transition text-xl mt-4">
                Confirm Meals & Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}