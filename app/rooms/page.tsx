"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";
import { SITE_CONFIG } from "../siteConfig";

export default function RoomsStep() {
  const router = useRouter();
  const { data, setData } = useFunnelStore();

  const initialCounts: Record<string, number> = {};
  SITE_CONFIG.rooms.forEach(r => { initialCounts[r.name] = 0; });

  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);
  if (!isLoaded) return null;

  const updateCount = (room: string, delta: number) => {
    const max = SITE_CONFIG.rooms.find(r => r.name === room)?.maxQty ?? 20;
    setCounts(prev => ({ ...prev, [room]: Math.max(0, Math.min(max, prev[room] + delta)) }));
  };

  const handleNext = () => {
    setData({ roomCounts: counts });
    router.push("/meals");
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-stone-900 mb-2 text-center">Build Your Room Block</h1>
        <p className="text-stone-500 text-center mb-10">Select the quantities needed for your group.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {SITE_CONFIG.rooms.map(room => (
            <div key={room.name} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
              <div className="h-40 bg-stone-200">
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-stone-900">{room.name}</h3>
                <p className="text-sm text-stone-500 mb-1">{room.description}</p>
                <p className="text-emerald-700 font-bold mb-4">${room.pricePerNight}/night</p>
                <div className="mt-auto flex items-center justify-between bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <button onClick={() => updateCount(room.name, -1)} className="w-10 h-10 bg-white rounded-lg shadow-sm text-stone-600 font-bold hover:text-emerald-700 transition">-</button>
                  <span className="font-black text-xl text-stone-800">{counts[room.name]}</span>
                  <button onClick={() => updateCount
