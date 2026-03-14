"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";

export default function ActivitiesStep() {
  const router = useRouter();
  const { data, setData } = useFunnelStore();
  const [activities, setActivities] = useState<Record<string, number>>(data.activities || {});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);
  if (!isLoaded) return null;

  const updateCount = (name: string, delta: number) => {
    setActivities(prev => ({ ...prev, [name]: Math.max(0, (prev[name] || 0) + delta) }));
  };

  const handleNext = () => {
    setData({ activities });
    router.push("/quote");
  };

  // Activities list with estimated pricing based on your venue data
  const activityOptions = [
    { name: "Canoe Rental", price: 25, unit: "canoe / 2 hrs" },
    { name: "Tubing & Rafting", price: 15, unit: "per person" },
    { name: "Pontoon Boat Experience", price: 150, unit: "per group" },
    { name: "Hoopla Island Obstacle", price: 20, unit: "per person" },
    { name: "Bannock Bake Activity", price: 10, unit: "per person" },
    { name: "Firepit with S'mores", price: 5, unit: "per person" },
    { name: "Wolf Howl Hike (Guided)", price: 12, unit: "per person" },
    { name: "Petroforms Guided Tour", price: 15, unit: "per person" }
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-stone-900 mb-2 text-center">Add Activities</h1>
        <p className="text-stone-500 text-center mb-10 text-lg">Customize your itinerary. Prices apply to both adults and children.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {activityOptions.map(act => (
            <div key={act.name} className="bg-white p-6 rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm hover:border-emerald-200 transition-colors">
              <div>
                <h3 className="font-bold text-stone-800 text-lg">{act.name}</h3>
                <p className="text-emerald-700 font-semibold">${act.price} <span className="text-stone-400 text-xs font-normal uppercase">/ {act.unit}</span></p>
              </div>
              
              <div className="flex items-center space-x-4 bg-stone-50 p-2 rounded-xl border border-stone-200">
                <button onClick={() => updateCount(act.name, -1)} className="w-10 h-10 bg-white rounded-lg shadow-sm text-stone-600 font-bold hover:bg-rose-50 hover:text-rose-600 transition">-</button>
                <span className="font-black text-xl w-8 text-center text-stone-800">{activities[act.name] || 0}</span>
                <button onClick={() => updateCount(act.name, 1)} className="w-10 h-10 bg-white rounded-lg shadow-sm text-stone-600 font-bold hover:bg-emerald-50 hover:text-emerald-700 transition">+</button>
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={handleNext} className="block w-full max-w-md mx-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xl font-bold py-5 rounded-2xl shadow-xl transition transform hover:-translate-y-1">
          Generate Final Quote →
        </button>
      </div>
    </div>
  );
}