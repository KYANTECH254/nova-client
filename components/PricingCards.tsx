"use client";

import { useState } from "react";
import { CheckCircle, Clock, Zap } from "lucide-react";
import SubscribePopup from "./Subscribe";

interface Plan {
    title: string;
    price: string;
    speed: string;
    validity: string;
    usage: string;
    devices: string;
    category: "Daily" | "Weekly" | "Monthly";
}

const plans: Plan[] = [
  {
    title: "30 Minutes Offer",
    price: "5",
    speed: "5 MBps",
    validity: "30 minutes",
    usage: "Unlimited",
    devices: "1 Device",
    category: "Daily",
  },
  {
    title: "1 Hour Offer",
    price: "10",
    speed: "10 MBps",
    validity: "1 Hour",
    usage: "Unlimited",
    devices: "1 Device",
    category: "Daily",
  },
  {
    title: "Daily Plan",
    price: "50",
    speed: "15 MBps",
    validity: "24 Hours",
    usage: "Unlimited",
    devices: "2 Devices",
    category: "Daily",
  },
  {
    title: "Weekly Plan",
    price: "300",
    speed: "20 MBps",
    validity: "7 Days",
    usage: "Unlimited",
    devices: "3 Devices",
    category: "Weekly",
  },
  {
    title: "Monthly Plan",
    price: "1200",
    speed: "25 MBps",
    validity: "30 Days",
    usage: "Unlimited",
    devices: "5 Devices",
    category: "Monthly",
  },
];

export default function PricingCards() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [filter, setFilter] = useState<"Daily" | "Weekly" | "Monthly">("Daily");

  const filteredPlans = plans.filter((plan) => plan.category === filter);

  return (
    <section className="py-12 px-4 md:px-8">
      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        {["Daily", "Weekly", "Monthly"].map((period) => (
          <button
            key={period}
            className={`px-6 py-2 font-semibold rounded-lg transition-all ${
              filter === period
                ? "bg-[#00AEEF] text-white shadow-lg"
                : "bg-white/10 text-gray-200 border border-white/20 hover:bg-[#00AEEF] hover:text-white"
            }`}
            onClick={() => setFilter(period as "Daily" | "Weekly" | "Monthly")}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPlans.map((plan, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md border border-white/20 hover:scale-105 transition-transform duration-300"
          >
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00AEEF]" /> {plan.title}
            </h3>
            <p className="text-4xl font-extrabold text-[#00AEEF]">shs.{plan.price}</p>
            <div className="mt-4 space-y-2 text-white text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> Upto {plan.speed} Speed
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" /> Valid for {plan.validity}
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> {plan.usage} Usage
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> {plan.devices}
              </p>
            </div>
            <button
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-all"
              onClick={() => setSelectedPlan(plan)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>

      {/* Subscription Popup */}
      {selectedPlan && <SubscribePopup plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </section>
  );
}
