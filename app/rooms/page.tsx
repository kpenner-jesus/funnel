"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";

export default function RoomsStep() {
  const router = useRouter();
  const { data, setData } = useFunnelStore();
  const [counts, setCounts] = useState<Record<string, number>>({ 
    "Bachelor Suite": 0, 
    "Couples Suite": 0, 
    "Family Suite": 0, 
    "Two-Bedroom Suite": 0 
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { 
    setIsLoaded(true); 
  }, []);

  if (!isLoaded) return null;

  const updateCount = (room: string, delta: number) => {
    setCounts(prev => ({ ...prev, [room]: Math.max(0, Math.min(20, prev[room] + delta)) }));
  };

  const handleNext = () => {
    setData({ roomCounts: counts });
    router.push("/meals");
  };

  const rooms = [
    { name: "Bachelor Suite", price: 89, desc: "Perfect for solo travelers. Includes a workspace.", img: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/64f656b232f87d8b032bbfec_64f5314887a8d9a399fc5123_firepit-p-800.webp" },
    { name: "Couples Suite", price: 119, desc: "A cozy, private space for two. Weekend getaway.", img: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/65396c9f6b39d1b64f3d2f2c_Couples-Suite-1-p-500.webp" },
    { name: "Family Suite", price: 139, desc: "Spacious enough for the whole family with a kitchenette.", img: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca55a8/657311f217211ce3d9e762c0_family-gathering-campfire.webp" },
    { name: "Two-Bedroom Suite", price: 159, desc: "Premium space with separate sleeping areas and a living room.", img: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/64f656924da1d90492a10511_64d168dd2b8dffcaee1f7621_Frame20427319192-min-min.webp" }
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-stone-900 mb-2 text-center">Build Your Room Block</h1>
        <p className="text-stone-500 text-center mb-10">Select the quantities needed for your group (Max 20 per type).</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {rooms.map(room => (
            <div key={room.name} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
              <div className="h-40 bg-stone-200">
                <img src={room.img} alt={room.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-bold text-stone-900">{room.name}</h3>
                <p className="text-sm text-stone-500 mb-4">${room.price}/night</p>
                <div className="mt-auto flex items-center justify-between bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <button onClick={() => updateCount(room.name, -1)} className="w-10 h-10 bg-white rounded-lg shadow-sm text-stone-600 font-bold hover:text-emerald-700 transition">-</button>
                  <span className="font-black text-xl text-stone-800">{counts[room.name]}</span>
                  <button onClick={() => updateCount(room.name, 1)} className="w-10 h-10 bg-white rounded-lg shadow-sm text-stone-600 font-bold hover:text-emerald-700 transition">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={handleNext} className="block w-full max-w-md mx-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xl font-bold py-4 rounded-xl shadow-lg transition">
          Next: Meals →
        </button>
      </div>
    </div>
  );
}