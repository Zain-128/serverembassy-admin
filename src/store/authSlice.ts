import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StaffUser } from "@/lib/api";

export const TOKEN_KEY = "se-admin-token";

type AuthState = {
  token: string | null;
  user: StaffUser | null;
};

function readToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

const initialState: AuthState = {
  token: readToken(),
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: StaffUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
    },
    setUser(state, action: PayloadAction<StaffUser>) {
      state.user = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
