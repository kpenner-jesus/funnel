"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";

export default function MealsStep() {
  const router = useRouter();
  const { data, setData } = useFunnelStore();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // We change the starting state to "undefined" to keep the build happy
  const [wantsMeals, setWantsMeals] = useState<boolean | undefined>(undefined);
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
    // We only send "true" or "false" to the store
    setData({ 
      wantsMeals: !!wantsMeals, 
      firstMeal, 
      lastMeal, 
      childAge 
    });
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
          <h1 className="text-3xl font-extrabold text-stone-900 mb-4 tracking-tight">Add a Meal Plan?</h1>
          <p className="text-stone-500 mb-8 font-medium">Your group qualifies for our full catering service at Wilderness Edge.</p>
          
          {wantsMeals === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setWantsMeals(true)} 
                className="p-8 border-2 border-emerald-100 bg-emerald-50 rounded-2xl hover:border-emerald-600 hover:shadow-md transition-all group"
              >
                <span className="block text-2xl font-bold text-emerald-900 mb-2 group-hover:text-emerald-600">Yes, Please</span>
                <span className="text-sm text-emerald-700">View catering options</span>
              </button>
              <button 
                onClick={handleNoThanks} 
                className="p-8 border-2 border-stone-200 rounded-2xl hover:border-stone-400 hover:shadow-md transition-all"
              >
                <span className="block text-2xl font-bold text-stone-700 mb-2">No Thanks</span>
                <span className="text-sm text-stone-500">I&apos;ll handle my own food</span>
              </button>
            </div>
          ) : (
            <div className="text-left space-y-6 animate-in fade-in duration-500">
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <label className="block font-bold text-stone-800 mb-2">Check-in Day (First Meal)</label>
                <select value={firstMeal} onChange={(e) => setFirstMeal(e.target.value)} className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none transition-all">
                  <option value="Supper">Start with Supper</option>
                  <option value="None">No meals on Check-in day</option>
                </select>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <label className="block font-bold text-stone-800 mb-2">Check-out Day (Last Meal)</label>
                <select value={lastMeal} onChange={(e) => setLastMeal(e.target.value)} className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-emerald-600 outline-none transition-all">
                  <option value="Breakfast">Breakfast Only</option>
                  <option value="Lunch">Breakfast & Lunch</option>
                </select>
              </div>

              {hasKids && (
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                  <label className="block font-bold text-emerald-900 mb-2">Average Age of Children (1-10)</label>
                  <p className="text-sm text-emerald-700 mb-4 font-medium">Kids meal pricing scales based on average age.</p>
                  <select value={childAge} onChange={(e) => setChildAge(Number(e.target.value))} className="w-full p-4 rounded-xl border-2 border-emerald-200 outline-none focus:border-emerald-600">
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} years old</option>
                    ))}
                  </select>
                </div>
              )}

              <button onClick={handleNext} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-5 rounded-2xl shadow-xl transition-all text-xl mt-4 active:scale-95">
                Confirm Meals & Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}