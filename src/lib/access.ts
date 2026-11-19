import { getDb } from "./db";
import type { ProjectRecord, SessionUser } from "./types";

export function canAccessProject(
  user: SessionUser,
  project: ProjectRecord
): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "FUNERAL_HOME") {
    return (
      Boolean(user.funeralHomeId) &&
      project.funeral_home_id === user.funeralHomeId
    );
  }
  if (user.role === "FAMILY_OWNER") {
    return (
      project.owner_id === user.id ||
      project.owner_email.toLowerCase() === user.email.toLowerCase()
    );
  }
  return false;
}

export function getAuthorizedProject(
  user: SessionUser,
  projectId: string
): ProjectRecord | null {
  const db = getDb();
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(projectId) as unknown as ProjectRecord | undefined;
  if (!project) return null;
  if (!canAccessProject(user, project)) return null;
  return project;
}
