"use client";

import { useState } from "react";
import { CheckCircle, Clock, PackageX, Zap } from "lucide-react";
import SubscribePopup from "./Subscribe";
import { Plan, usePlatform } from "@/contexts/PlatformProvider";
import NetFundiPackages from "./Templates/Packages/NetFundi/Packages";

export default function PricingCards() {
  const { platformData, packages, error, isConnected } = usePlatform();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [filter, setFilter] = useState<"Daily" | "Weekly" | "Monthly" | "Data">("Daily");
  const filteredPlans = packages.filter((plan) => plan.category === filter);

  return (
    <>
      {platformData.template === "Nova Special" && (
        <>
          <section className="py-12 px-4 md:px-8">
            {/* Filter Buttons */}
            <div className="flex justify-center flex-wrap gap-4 mb-8">
              {["Daily", "Weekly", "Monthly", "Data"].map((period) => (
                <button
                  key={period}
                  className={`px-6 py-2 font-semibold rounded-lg transition-all ${filter === period
                    ? "bg-[#00AEEF] text-white shadow-lg"
                    : "bg-white/10 text-gray-200 border border-white/20 hover:bg-[#00AEEF] hover:text-white"
                    }`}
                  onClick={() => setFilter(period as "Daily" | "Weekly" | "Monthly" | "Data")}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Pricing Cards */}
            {filteredPlans.length > 0 ? (
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPlans
                  .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                  .map((plan, index) => (
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
                          <Clock className="w-4 h-4 text-yellow-400" />
                          {(plan.period || "").trim() === "NoExpiry" ? "NO EXPIRY" : plan.period}
                        </p>

                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" /> {plan.usage} Usage
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {parseInt(plan.devices) === 1
                            ? `${plan.devices} Device`
                            : parseInt(plan.devices) < 1
                              ? 'Unlimited Devices'
                              : `${plan.devices} Devices`}
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
          </section>
        </>
      )}
      
      {platformData.template === "Nova Simple" && (
        <>
          <section className="py-12 px-4 md:px-8 dark:bg-black bg-white dark:text-white text-black">
            {/* Filter Buttons */}
            <div className="flex justify-center flex-wrap gap-4 mb-8">
              {["Daily", "Weekly", "Monthly", "Data"].map((period) => (
                <button
                  key={period}
                  className={`px-6 py-2 font-semibold rounded-lg transition-all ${filter === period
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-200 border border-white/20 hover:bg-blue-600 hover:text-white"
                    }`}
                  onClick={() => setFilter(period as "Daily" | "Weekly" | "Monthly" | "Data")}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Pricing Cards */}
            {filteredPlans.length > 0 ? (
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
                {filteredPlans
                  .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                  .map((plan, index) => (
                    <div
                      key={index}
                      className="bg-white/90 dark:bg-white/10 backdrop-blur-lg p-3 rounded-2xl shadow-md border border-white/80 dark:border-white/20 hover:scale-105 transition-transform duration-300"
                    >
                      <div className="flex flex-row items-center gap-2">
                        <h6 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                          {plan.name}
                        </h6>
                        <p className="text-2xl font-extrabold text-[#00AEEF]">shs.{plan.price}</p>
                      </div>

                      <div className="flex flex-wrap mt-2 gap-2 text-black dark:text-white text-sm">
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />{plan.speed}Mbps
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          {(plan.period || "").trim() === "NoExpiry" ? "NO EXPIRY" : plan.period}
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {parseInt(plan.devices) === 1
                            ? `${plan.devices} Device`
                            : parseInt(plan.devices) < 1
                              ? 'Unlimited Devices'
                              : `${plan.devices} Devices`}
                        </p>
                      </div>
                      <button
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-all"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        Subscribe
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <h2 className="text-2xl font-bold text-gray-300">No Packages Available</h2>
              </div>
            )}
          </section>
        </>
      )}

      {platformData.template === "NetFundi" && (
        <NetFundiPackages
          filter={filter}
          setFilter={setFilter}
          filteredPlans={filteredPlans}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
        />
      )}

      {/* Subscription Popup */}
      {selectedPlan && <SubscribePopup plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </>
  );
}
