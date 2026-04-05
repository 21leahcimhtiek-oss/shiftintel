import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Plus, Search, Filter } from "lucide-react";
import EmployeeCard from "@/components/EmployeeCard";
import Link from "next/link";

export const metadata = { title: "Employees" };

export default async function EmployeesPage({ searchParams }: { searchParams: { dept?: string; q?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase.from("org_members").select("org_id, role").eq("user_id", user.id).single();
  if (!member) redirect("/login");

  let query = supabase.from("employees").select("*").eq("org_id", member.org_id).order("name");
  if (searchParams.dept) query = query.eq("department", searchParams.dept);

  const { data: employees } = await query;

  const departments = [...new Set((employees || []).map(e => e.department).filter(Boolean))];

  const filtered = searchParams.q
    ? (employees || []).filter(e => e.name.toLowerCase().includes(searchParams.q!.toLowerCase()) || e.email.toLowerCase().includes(searchParams.q!.toLowerCase()))
    : employees || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 mt-1">{filtered.length} team member{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {(member.role === "owner" || member.role === "admin" || member.role === "manager") && (
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input placeholder="Search employees..." className="text-sm outline-none flex-1 bg-transparent" />
        </div>
        <div className="flex gap-2">
          <Link
            href="/employees"
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${!searchParams.dept ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
          >All</Link>
          {departments.map(dept => (
            <Link
              key={dept}
              href={`/employees?dept=${dept}`}
              className={`text-sm px-3 py-2 rounded-lg border transition-colors ${searchParams.dept === dept ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
            >{dept}</Link>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(employee => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No employees found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first employee to get started</p>
        </div>
      )}
    </div>
  );
}