"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DatesStep() {
  const router = useRouter();
  const { data, setData } = useFunnelStore();
  const [range, setRange] = useState<DateRange | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { 
    setIsLoaded(true); 
  }, []);

  if (!isLoaded) return null;

  const handleNext = () => {
    if (range?.from) {
      setData({ dateRange: { from: range.from.toISOString(), to: range.to?.toISOString() || range.from.toISOString() } });
      router.push("/rooms");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans pt-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white shadow-xl rounded-3xl p-8 border border-stone-200 text-center">
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">When are you visiting?</h1>
          <p className="text-stone-500 mb-8">Select your check-in and check-out dates.</p>

          <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 mb-8 inline-block scale-105">
            <DayPicker 
              mode="range" 
              selected={range} 
              onSelect={setRange}
              disabled={{ before: new Date() }}
              modifiersClassNames={{ selected: "bg-emerald-700 text-white font-bold", today: "text-amber-600 font-bold" }}
            />
          </div>

          <button 
            onClick={handleNext} 
            disabled={!range?.from} 
            className={`w-full py-4 rounded-xl text-xl font-bold transition ${range?.from ? "bg-emerald-700 text-white shadow-lg" : "bg-stone-200 text-stone-400"}`}
          >
            Next: Guest Rooms →
          </button>
        </div>
      </div>
    </div>
  );
}