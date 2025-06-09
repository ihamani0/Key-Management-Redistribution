/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, logout, Authcheck } from "../../Service/auth.service.js";

//middlware
export const loginUser = createAsyncThunk(
  "auth/login-user",
  async (credentials, { rejectWithValue }) => {
    try {
      return await login(credentials);

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout-user",
  async (_, { rejectWithValue }) => {
    try {
      return await logout();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check-auth",
  async (_, { rejectWithValue }) => {
    try {
      return await Authcheck();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuth: false,
  error: "",
  isAuthLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state, action) => {
        state.isAuthLoading = true;
        state.error = ""; // Clear error on new attempt
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = true;
        state.user = action.payload.user;
        state.error = ""; // Clear error on new attempt
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = false;
        state.user = null;
        state.error = action.payload || "Login failed";
      })
      .addCase(checkAuth.pending, (state, action) => {
        state.isAuthLoading = true;
        state.error = ""; // Clear error on new attempt
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = true;
        state.user = action.payload.user;
        state.error = ""; // Clear error on new attempt
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = false;
        state.user = null;
      })
      .addCase(logoutUser.pending, (state, action) => {
        state.isAuthLoading = true;
        state.error = ""; // Clear error on new attempt
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = null;
        state.isAuth = false;
        state.error = "";
        state.isAuthLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.error = action.payload || "Login failed";
      })
  },
});




//getters

export const selecteIsAuthLoading = (state) => state.auth.isAuthLoading;
export const selectIsAuthenticated = (state) => state.auth.isAuth;
export const selectUser = (state) => state.auth.user;
// export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
