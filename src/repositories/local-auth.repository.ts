export interface LocalSession { userId: string; createdAt: string; }

const SESSION_KEY = "sitecost-erp-session-v1";

export interface AuthSessionRepository {
  load(): LocalSession | undefined;
  save(session: LocalSession): void;
  clear(): void;
}

export class LocalAuthSessionRepository implements AuthSessionRepository {
  load(): LocalSession | undefined {
    if (typeof window === "undefined") return undefined;
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    try {
      const value = JSON.parse(raw) as Partial<LocalSession>;
      return typeof value.userId === "string" && typeof value.createdAt === "string" ? value as LocalSession : undefined;
    } catch { return undefined; }
  }

  save(session: LocalSession): void {
    if (typeof window !== "undefined") window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(SESSION_KEY);
  }
}

export const authSessionRepository = new LocalAuthSessionRepository();
