"use client";
import { useState } from "react";
import { CheckCircle, Zap, Building2, Rocket, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: 59,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    features: ["25 employees", "1 location", "Basic scheduling", "Time-off management", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Rocket,
    price: 149,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    popular: true,
    features: ["100 employees", "5 locations", "AI schedule generation", "Labor forecasting", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    price: 349,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    features: ["Unlimited employees", "Unlimited locations", "Compliance reports", "REST API", "Dedicated manager"],
  },
];

interface BillingPlansProps {
  currentPlan: string;
  hasSubscription: boolean;
}

export default function BillingPlans({ currentPlan, hasSubscription }: BillingPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {hasSubscription && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Current Plan: <span className="text-blue-600 capitalize">{currentPlan}</span></p>
            <p className="text-sm text-gray-500 mt-1">Manage payment methods, invoices, and cancellation</p>
          </div>
          <button
            onClick={handleManage}
            disabled={loading === "portal"}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-60"
          >
            {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Manage Billing
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border p-6 ${plan.popular ? "border-blue-400 shadow-lg" : "border-gray-200"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
                </div>
              )}
              <div className={`w-10 h-10 ${plan.bg} rounded-xl flex items-center justify-center mb-4`}>
                <plan.icon className={`w-5 h-5 ${plan.color}`} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="text-center py-2 bg-green-50 rounded-lg text-sm font-medium text-green-700">Current Plan</div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {currentPlan === "starter" || !hasSubscription ? "Upgrade" : "Switch Plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}