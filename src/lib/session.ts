const LOCAL_STORAGE_KEY = 'mp_session_id';
const COOKIE_NAME = 'mp_session_id';

function readCookie(name: string): string | null {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
	return null;
}

function writeCookie(name: string, value: string, days: number) {
	const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
	document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getOrCreateSessionId(): string {
	if (typeof window === 'undefined') return '';
	try {
		let sessionId = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (sessionId && sessionId.length > 0) {
			// keep cookie in sync
			if (!readCookie(COOKIE_NAME)) writeCookie(COOKIE_NAME, sessionId, 400);
			return sessionId;
		}

		sessionId = crypto.randomUUID();
		localStorage.setItem(LOCAL_STORAGE_KEY, sessionId);
		writeCookie(COOKIE_NAME, sessionId, 400);
		return sessionId;
	} catch {
		// fallback without localStorage
		const existing = readCookie(COOKIE_NAME);
		if (existing) return existing;
		const sid = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
		writeCookie(COOKIE_NAME, sid, 400);
		return sid;
	}
}


