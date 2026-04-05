import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, Building2, Bell, Shield } from "lucide-react";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role, orgs(*)").eq("user_id", user.id).single();
  if (!member) redirect("/login");

  const org = member.orgs as any;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your organization settings</p>
      </div>

      {/* Org Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Organization</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
          <input
            type="text" defaultValue={org.name}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            readOnly={!["owner", "admin"].includes(member.role)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            defaultValue={org.timezone}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="America/New_York">Eastern (ET)</option>
            <option value="America/Chicago">Central (CT)</option>
            <option value="America/Denver">Mountain (MT)</option>
            <option value="America/Los_Angeles">Pacific (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Berlin">Berlin (CET)</option>
          </select>
        </div>
        {["owner", "admin"].includes(member.role) && (
          <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Notifications</h2>
        </div>
        {[
          { label: "Coverage gap alerts", desc: "Alert when coverage drops below 80%" },
          { label: "Overtime warnings", desc: "Notify when employee approaches OT threshold" },
          { label: "Time-off requests", desc: "Email when new time-off request submitted" },
          { label: "Schedule published", desc: "Notify employees when schedule is published" },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Security</h2>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Change Password</button>
      </div>
    </div>
  );
}