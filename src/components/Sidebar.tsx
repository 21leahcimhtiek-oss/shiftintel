"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, Clock, Shield, DollarSign, Settings, CreditCard, Zap, LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Org, OrgMemberRole } from "@/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/time-off", label: "Time Off", icon: Clock },
  { href: "/coverage", label: "Coverage", icon: Shield },
  { href: "/labor-costs", label: "Labor Costs", icon: DollarSign, roles: ["owner", "admin", "manager"] },
  { href: "/billing", label: "Billing", icon: CreditCard, roles: ["owner", "admin"] },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  org: Org;
  userRole: OrgMemberRole;
}

export default function Sidebar({ org, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const visibleNav = NAV.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white truncate">ShiftIntel</p>
          <p className="text-xs text-slate-400 truncate">{org.name}</p>
        </div>
      </div>

      {/* Plan badge */}
      <div className="px-6 py-3 border-b border-slate-800">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
          org.plan === "enterprise" ? "bg-purple-900 text-purple-300" :
          org.plan === "pro" ? "bg-blue-900 text-blue-300" :
          "bg-slate-700 text-slate-300"
        }`}>{org.plan}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}