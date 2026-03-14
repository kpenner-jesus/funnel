"use client";

import { useRouter } from "next/navigation";
import { useFunnelStore } from "./store";

export default function WelcomeStep() {
  const router = useRouter();
  const setFunnelData = useFunnelStore((state) => state.setData);

  const handleSegmentSelection = (segment: string) => {
    // Initialize with defaults: 1 Adult, 0 Children
    setFunnelData({ 
      eventSegment: segment,
      adultCount: 1,
      childCount: 0 
    });
    router.push("/event-type");
  };

  const segments = [
    { name: "Group Retreat", desc: "(Church, Corporate, Youth...)" },
    { name: "Group Conference", desc: "(Business, Gov, Non-Profit...)" },
    { name: "Family Gathering", desc: "(Reunion, Holiday, Milestone)" },
    { name: "Wedding", desc: "(Ceremony, Reception, or Both)" },
    { name: "Individual Guest", desc: "(Solo, Couple, Small Group)" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Hero Image Section */}
      <div 
        className="w-full h-80 bg-cover bg-center relative mb-8" 
        style={{ backgroundImage: "url('https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/64f656924da1d90492a10511_64d168dd2b8dffcaee1f7621_Frame20427319192-min-min.webp')" }}
      >
        <div className="absolute inset-0 bg-stone-900 bg-opacity-40 flex items-center justify-center"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 -mt-24">
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-8 md:p-12 border border-stone-200">
          
          <div className="mb-6 flex justify-between items-center">
            <span className="font-bold text-xl tracking-tight text-emerald-900 uppercase">Wilderness Edge</span>
            <span className="text-sm font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              Step 1 of 5
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-stone-900 mb-4 text-center tracking-tight">
            Plan Your Perfect Stay
          </h1>
          
          <div className="text-stone-600 mb-10 text-center text-lg leading-relaxed max-w-2xl mx-auto">
            <p>Welcome to Manitoba's premier waterfront venue. Let's build your personalized quote including lodging, catering, and activities.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {segments.map((seg) => (
              <button
                key={seg.name}
                onClick={() => handleSegmentSelection(seg.name)}
                className="p-6 border-2 border-stone-100 rounded-2xl hover:border-emerald-600 hover:shadow-xl transition-all text-left flex flex-col justify-center bg-white group shadow-sm"
              >
                <span className="text-xl font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                  {seg.name}
                </span>
                <span className="text-sm text-stone-400 mt-1 font-medium">
                  {seg.desc}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}