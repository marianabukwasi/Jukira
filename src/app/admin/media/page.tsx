import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "../dashboard/page";

export default async function AdminMediaPage() {
  ensureSeeded();
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT m.*, p.deceased_full_name, c.name as contributor_name
       FROM media m
       JOIN projects p ON p.id = m.project_id
       JOIN contributors c ON c.id = m.contributor_id
       ORDER BY m.created_at DESC
       LIMIT 100`
    )
    .all() as {
    id: string;
    project_id: string;
    deceased_full_name: string;
    contributor_name: string;
    file_type: string;
    original_filename: string;
    file_size: number;
    enhancement_preference: string;
    approval_status: string;
  }[];

  return (
    <DashboardShell user={user} portalLabel="Jukira Admin" navItems={ADMIN_NAV}>
      <h1 className="font-editorial text-3xl text-[#202020] mb-6">
        Global Media Inspector
      </h1>
      <div className="bg-white border border-[#E8E6E0] rounded-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F7F3] text-[#77746F] border-b border-[#E8E6E0]">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Contributor</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Enhancement</th>
              <th className="px-4 py-3">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6E0]">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/projects/${r.project_id}`}
                    className="underline font-medium"
                  >
                    {r.deceased_full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {r.original_filename} ({r.file_type})
                </td>
                <td className="px-4 py-3">{r.contributor_name}</td>
                <td className="px-4 py-3">
                  {(r.file_size / (1024 * 1024)).toFixed(2)} MB
                </td>
                <td className="px-4 py-3">{r.enhancement_preference}</td>
                <td className="px-4 py-3">
                  <a
                    href={`/api/media/${r.id}/file?download=1`}
                    className="underline"
                  >
                    Original
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
