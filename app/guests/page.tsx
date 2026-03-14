"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";

export default function GuestsStep() {
  const router = useRouter();
  const { data, setData } = useFunnelStore();
  const [adults, setAdults] = useState(data.adultCount || 1);
  const [children, setChildren] = useState(data.childCount || 0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (!data.eventSegment) router.push("/");
  }, [data.eventSegment, router]);

  if (!isLoaded) return null;

  const handleNext = () => {
    setData({ adultCount: adults, childCount: children });
    router.push("/dates");
  };

  const adjustCount = (type: "adults" | "children", amount: number) => {
    if (type === "adults") setAdults((prev) => Math.max(1, prev + amount));
    if (type === "children") setChildren((prev) => Math.max(0, prev + amount));
  };

  const CounterRow = ({ title, desc, val, type }: { title: string, desc: string, val: number, type: "adults" | "children" }) => (
    <div className="mb-10 pb-10 border-b border-stone-100 last:border-0 last:pb-0 last:mb-6">
      <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
      <p className="text-stone-500 mb-6">{desc}</p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <div className="flex space-x-2">
          <button onClick={() => adjustCount(type, -100)} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-rose-100 transition">-100</button>
          <button onClick={() => adjustCount(type, -10)} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-rose-100 transition">-10</button>
          <button onClick={() => adjustCount(type, -1)} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 text-xl font-bold hover:bg-rose-100 transition">-</button>
        </div>
        <div className="flex items-center justify-center min-w-[100px]">
          <span className="text-5xl font-black text-emerald-800">{val}</span>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => adjustCount(type, 1)} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 text-xl font-bold hover:bg-emerald-100 transition">+</button>
          <button onClick={() => adjustCount(type, 10)} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-emerald-100 transition">+10</button>
          <button onClick={() => adjustCount(type, 100)} className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-emerald-100 transition">+100</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans pt-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white shadow-xl rounded-3xl p-8 md:p-12 border border-stone-200 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-8 tracking-tight">Who is attending?</h1>
          
          <CounterRow title="Adults" desc="Ages 18 and older" val={adults} type="adults" />
          <CounterRow title="Children" desc="Under 18 years old" val={children} type="children" />

          <button onClick={handleNext} className="w-full max-w-md mx-auto block bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition text-xl mt-8">
            Next: Choose Dates →
          </button>
        </div>
      </div>
    </div>
  );
}