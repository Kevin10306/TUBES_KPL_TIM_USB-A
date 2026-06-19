export type SessionUser = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
};

const SESSION_KEY = "cukurin_user";

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSessionUser() {
  localStorage.removeItem(SESSION_KEY);
}
