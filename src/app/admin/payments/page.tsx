import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/pricing";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";
import type { OrderPaymentRecord } from "@/lib/types";

export default async function AdminPaymentsPage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM orders_payments ORDER BY created_at DESC")
    .all() as unknown as OrderPaymentRecord[];

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <h1 className="font-editorial text-3xl text-[#202020] mb-6">
        Orders, Invoices &amp; Payments
      </h1>
      <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F7F3] text-[#77746F] border-b border-[#E8E6E0]">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6E0]">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{r.invoice_number}</td>
                <td className="px-4 py-3">{r.customer_name}</td>
                <td className="px-4 py-3">{r.package_label}</td>
                <td className="px-4 py-3">
                  {formatCurrency(r.amount, r.currency)}
                </td>
                <td className="px-4 py-3">{r.payment_status}</td>
                <td className="px-4 py-3 text-[#77746F]">
                  {new Date(r.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
