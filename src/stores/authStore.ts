import { create } from 'zustand';

interface AuthUser {
  userId: string;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  username: string | null;
  createdAt: number | null;
  lastSignInAt: number | null;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  externalAccounts: { provider: string; email: string | null }[];
}

interface AuthState extends AuthUser {
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}

const emptyUser: AuthUser = {
  userId: '' as string,
  email: null,
  fullName: null,
  firstName: null,
  lastName: null,
  imageUrl: null,
  username: null,
  createdAt: null,
  lastSignInAt: null,
  twoFactorEnabled: false,
  emailVerified: false,
  externalAccounts: [],
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  ...emptyUser,
  setAuth: (user) => set({ isAuthenticated: true, ...user }),
  clearAuth: () => set({ isAuthenticated: false, ...emptyUser }),
}));
