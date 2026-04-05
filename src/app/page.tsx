import Link from "next/link";
import { Brain, Calendar, DollarSign, Shield, Users, TrendingUp, CheckCircle, ArrowRight, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Scheduling",
    description: "GPT-4o generates optimal shift assignments in seconds, minimizing overtime while guaranteeing full coverage.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Labor Cost Forecasting",
    description: "4-week cost projections with confidence intervals. Know your labor budget before the week starts.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Compliance Tracking",
    description: "Automatic overtime alerts, break enforcement, and max-hours tracking. Stay compliant effortlessly.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Employee profiles with skills, availability, and time-off integrated directly into scheduling logic.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const plans = [
  {
    name: "Starter",
    price: 59,
    description: "Perfect for small teams getting started",
    features: ["Up to 25 employees", "1 location", "Basic scheduling", "Time-off management", "Email support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: 149,
    description: "For growing businesses with AI needs",
    features: ["Up to 100 employees", "5 locations", "AI schedule generation", "Labor forecasting", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 349,
    description: "Unlimited scale with compliance tooling",
    features: ["Unlimited employees", "Unlimited locations", "Compliance reports", "REST API", "Dedicated manager"],
    cta: "Contact Sales",
    popular: false,
  },
];

const stats = [
  { value: "80%", label: "Reduction in scheduling time" },
  { value: "25%", label: "Average OT cost savings" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 30s", label: "AI schedule generation" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">ShiftIntel</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/signup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
              <Brain className="w-4 h-4" />
              Powered by GPT-4o
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              AI-optimized schedules.{" "}
              <span className="text-blue-400">Zero coverage gaps.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              ShiftIntel generates a full week of optimized shifts in under 30 seconds.
              Minimize overtime, maximize coverage, and forecast labor costs with enterprise-grade AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-colors">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#pricing" className="border border-white/20 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run smart schedules</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From AI generation to compliance tracking, ShiftIntel covers the full scheduling lifecycle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600">Start free, scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-8 border ${plan.popular ? "border-blue-500 shadow-xl shadow-blue-100 bg-blue-50" : "border-gray-200 bg-white"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Enterprise" ? "mailto:sales@shiftintel.com" : "/signup"}
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${plan.popular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">ShiftIntel</span>
            </div>
            <p className="text-sm">© 2024 ShiftIntel. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:support@shiftintel.com" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}