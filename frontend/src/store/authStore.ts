import { create } from "zustand";

export type AuthUser = {
  name: string;
  email: string;
};

type PersistedAuth = {
  user: AuthUser;
  token: string;
};

type AuthStatus = "anonymous" | "authenticated";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  rememberMe: boolean;

  hydrateFromStorage: () => void;
  setRememberMe: (rememberMe: boolean) => void;
  loginSuccess: (payload: PersistedAuth, rememberMe: boolean) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
};

const STORAGE_KEY = "home-ledger.auth";

function readPersistedAuth(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAuth;
    if (!parsed?.token || !parsed?.user?.email || !parsed?.user?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedAuth(value: PersistedAuth | null) {
  try {
    if (!value) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore storage quota / privacy mode issues
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: "anonymous",
  user: null,
  token: null,
  rememberMe: false,

  hydrateFromStorage: () => {
    const persisted = readPersistedAuth();
    if (!persisted) return;
    set({
      status: "authenticated",
      user: persisted.user,
      token: persisted.token,
      rememberMe: true,
    });
  },

  setRememberMe: (rememberMe) => set({ rememberMe }),

  loginSuccess: (payload, rememberMe) => {
    set({
      status: "authenticated",
      user: payload.user,
      token: payload.token,
      rememberMe,
    });

    if (rememberMe) writePersistedAuth(payload);
    else writePersistedAuth(null);
  },

  updateUser: (user) => {
    const state = get();
    if (!state.token) return;

    set({ user });

    if (state.rememberMe) {
      writePersistedAuth({ user, token: state.token });
    }
  },

  logout: () => {
    const rememberMe = get().rememberMe;
    set({
      status: "anonymous",
      user: null,
      token: null,
      rememberMe: false,
    });
    if (rememberMe) writePersistedAuth(null);
  },
}));

export function getAccessToken(): string | null {
  return useAuthStore.getState().token;
}

