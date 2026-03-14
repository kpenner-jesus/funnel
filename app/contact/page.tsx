"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "../store";
import emailjs from "@emailjs/browser";

export default function ContactStep() {
  const router = useRouter();
  const { data, reset } = useFunnelStore();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  useEffect(() => { 
    setIsLoaded(true);
    // Initialize using the Public Key from the built-in Vault
    const pubKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (pubKey) {
      emailjs.init(pubKey);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const fName = formData.get("first_name") as string;
    const lName = formData.get("last_name") as string;
    const uEmail = formData.get("user_email") as string;
    setSubmittedName(fName);

    // Build the email summary
    const dateStr = data.dateRange?.from 
      ? `${new Date(data.dateRange.from).toLocaleDateString()} to ${new Date(data.dateRange.to || "").toLocaleDateString()}`
      : "Dates not set";
    
    let items = "";
    Object.entries(data.roomCounts || {}).forEach(([name, qty]) => {
      if (qty > 0) items += `\n- ${qty}x ${name}`;
    });

    const emailContent = `
OFFICIAL QUOTE REQUEST
-----------------------
CUSTOMER: ${fName} ${lName}
EMAIL: ${uEmail}
DATES: ${dateStr}
LODGING: ${items || "None"}
MEALS: ${data.wantsMeals ? "Yes" : "No"}
-----------------------
    `;

    try {
      // Pulling directly from the StackBlitz Vault
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, 
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!, 
        {
          to_name: "Wilderness Edge Coordinator",
          from_name: `${fName} ${lName}`,
          reply_to: uEmail,
          message: emailContent
        }, 
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setSent(true);
      setTimeout(() => { reset(); router.push("/"); }, 5000);
    } catch (err: any) {
      alert("Vault Error: " + (err?.text || "The app couldn't find your keys in the settings."));
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  if (sent) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl flex items-center justify-center">✓</div>
          <h2 className="text-3xl font-black text-stone-900 mb-2">Quote Sent!</h2>
          <p className="text-stone-500 mb-6 text-lg">Thank you, {submittedName}. Check your inbox!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-2xl border border-stone-200">
        <h1 className="text-3xl font-black text-stone-900 mb-6 text-center">Get Your Official Quote</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input required name="first_name" placeholder="First Name" className="p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600" />
            <input required name="last_name" placeholder="Last Name" className="p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600" />
          </div>
          <input required name="user_email" type="email" placeholder="Email Address" className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-600" />
          <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white font-bold py-5 rounded-2xl shadow-xl text-xl">
            {loading ? "Sending..." : "Email My Official Quote"}
          </button>
        </form>
      </div>
    </div>
  );
}