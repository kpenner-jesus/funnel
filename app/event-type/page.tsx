"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";

export default function EventTypeStep() {
  const router = useRouter();
  const funnelData = useFunnelStore((state) => state.data);
  const setFunnelData = useFunnelStore((state) => state.setData);
  
  // This prevents the page from loading before the "Brain" remembers what they clicked
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // If they magically landed on this page without picking a segment in Step 1, send them back!
    if (!funnelData.eventSegment) {
      router.push("/");
    }
    
    // If they picked "Individual Guest", they don't need this step. Fast-forward them to Dates!
    if (funnelData.eventSegment === "Individual Guest") {
      router.push("/guests");
    }
  }, [funnelData.eventSegment, router]);

  if (!isLoaded || !funnelData.eventSegment || funnelData.eventSegment === "Individual Guest") {
    return null; // Show a blank screen for a split second while calculating
  }

  // --- THE SMART LOGIC ---
  // We define the buttons based on what they clicked in Step 1
  let title = "Tell us about your event";
  let options: string[] = [];

  if (funnelData.eventSegment === "Group Retreat") {
    title = "What type of retreat are you planning?";
    options = ["Church / Faith-based", "Marriage / Couples", "Women's / Ladies'", "Men's Retreat", "Youth / School", "Corporate / Business", "Wellness / Personal Growth", "Other"];
  } else if (funnelData.eventSegment === "Group Conference") {
    title = "What type of conference are you planning?";
    options = ["Corporate / Business", "Government / Department", "Non-Profit Organization", "Church / Faith-based", "First Nations / Indigenous", "College / University", "Other"];
  } else if (funnelData.eventSegment === "Family Gathering") {
    title = "What type of family gathering are you planning?";
    options = ["Family Reunion", "Family Holiday", "Milestone Anniversary", "Milestone Birthday", "Retirement Celebration", "Other"];
  } else if (funnelData.eventSegment === "Wedding") {
    title = "Tell us about your special day!";
    options = ["Ceremony & Reception", "Ceremony Only", "Reception Only"];
  }

  // When they click a specific type, save it and move to Step 3 (Dates)
  const handleTypeSelection = (selection: string) => {
    setFunnelData({ specificType: selection });
    router.push("/guests");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans pt-12">
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        
        {/* Navigation / Progress Bar */}
        <div className="mb-8">
          <button onClick={() => router.push("/")} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition flex items-center space-x-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            <span>Back to Start</span>
          </button>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <span className="font-bold text-slate-800">{funnelData.eventSegment}</span>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Step 2 of 5</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12 border border-slate-100">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-center tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500 text-center mb-10">
            This helps us connect you with the right coordinator and tailor your quote.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleTypeSelection(opt)}
                className="px-5 py-4 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-blue-400 hover:bg-slate-50 transition-all text-left flex items-center justify-between group"
              >
                {opt}
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}