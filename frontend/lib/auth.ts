import { API_BASE } from '@/lib/theme';

const TOKEN_KEY = 'crophealth_token';
const USER_KEY = 'crophealth_user';

export interface Session {
  token: string;
  username: string;
}

export async function login(username: string, password: string): Promise<Session> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) throw new Error('Invalid username or password.');
  if (!res.ok) throw new Error(`Login failed (HTTP ${res.status}).`);
  const data = await res.json();
  const session: Session = { token: data.token, username: data.username };
  saveSession(session);
  return session;
}

// Asks the backend whether the stored token is still valid.
export async function validateSession(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const data = await res.json();
    return data.username as string;
  } catch {
    // Backend unreachable: keep the stored user so the shell can show an offline state.
    return localStorage.getItem(USER_KEY);
  }
}

export function getToken(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

export function saveSession(session: Session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, session.username);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function storedUsername(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem(USER_KEY);
}
