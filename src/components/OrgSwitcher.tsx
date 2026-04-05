"use client";
import { useState } from "react";
import { ChevronDown, Building2, Check } from "lucide-react";
import type { Org } from "@/types";

interface OrgSwitcherProps {
  currentOrg: Org;
  orgs: Org[];
  onSwitch: (orgId: string) => void;
}

export default function OrgSwitcher({ currentOrg, orgs, onSwitch }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
      >
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="max-w-32 truncate">{currentOrg.name}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50 animate-fade-in">
          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => { onSwitch(org.id); setOpen(false); }}
              className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="truncate">{org.name}</span>
              {org.id === currentOrg.id && <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}