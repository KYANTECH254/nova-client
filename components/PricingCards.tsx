"use client";

import { useState } from "react";
import { CheckCircle, Clock, PackageX, Zap } from "lucide-react";
import SubscribePopup from "./Subscribe";
import { Plan, usePlatform } from "@/contexts/PlatformProvider";

const plans: Plan[] = [
  {
    name: "30 Minutes Offer",
    price: "5",
    speed: "5 MBps",
    period: "30 minutes",
    usage: "Unlimited",
    devices: "1 Device",
    category: "Daily",
  },
  {
    name: "1 Hour Offer",
    price: "10",
    speed: "10 MBps",
    period: "1 Hour",
    usage: "Unlimited",
    devices: "1 Device",
    category: "Daily",
  },
  {
    name: "Daily Plan",
    price: "50",
    speed: "15 MBps",
    period: "24 Hours",
    usage: "Unlimited",
    devices: "2 Devices",
    category: "Daily",
  },
  {
    name: "Weekly Plan",
    price: "300",
    speed: "20 MBps",
    period: "7 Days",
    usage: "Unlimited",
    devices: "3 Devices",
    category: "Weekly",
  },
  {
    name: "Monthly Plan",
    price: "1200",
    speed: "25 MBps",
    period: "30 Days",
    usage: "Unlimited",
    devices: "5 Devices",
    category: "Monthly",
  },
];

export default function PricingCards() {
  const { platformData, packages, error, isConnected } = usePlatform();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [filter, setFilter] = useState<"Daily" | "Weekly" | "Monthly">("Daily");

  const filteredPlans = packages.filter((plan) => plan.category === filter);

  return (
    <section className="py-12 px-4 md:px-8">
      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        {["Daily", "Weekly", "Monthly"].map((period) => (
          <button
            key={period}
            className={`px-6 py-2 font-semibold rounded-lg transition-all ${filter === period
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
      {filteredPlans.length > 0 ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md border border-white/20 hover:scale-105 transition-transform duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00AEEF]" /> {plan.name}
              </h3>
              <p className="text-4xl font-extrabold text-[#00AEEF]">shs.{plan.price}</p>
              <div className="mt-4 space-y-2 text-white text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Upto {plan.speed}Mbps Speed
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Valid for {plan.period}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> {plan.usage} Usage
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />{parseInt(plan.devices) === 1 ? `${plan.devices} Device` : parseInt(plan.devices) < 1 ? 'Unlimited Devices' : `${plan.devices} Devices`}
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
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <PackageX className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-300">No Packages Available</h2>
          <p className="text-gray-400 max-w-md">
            It looks like there are no plans available for the <strong>{filter}</strong> period.
            Please check back later or try selecting a different plan category.
          </p>
        </div>
      )}


      {/* Subscription Popup */}
      {selectedPlan && <SubscribePopup plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </section>
  );
}
