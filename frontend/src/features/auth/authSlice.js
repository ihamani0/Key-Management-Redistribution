/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkAuthAPI, loginAPI, logoutAPI } from "./authApi";

//middlware
export const loginUser = createAsyncThunk(
  "auth/login-user",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginAPI(credentials);

      return response;  
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout-user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutAPI();
      return response; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check-auth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkAuthAPI();
      return response;  
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
        state.token = localStorage.getItem("authToken");
        state.error = ""; // Clear error on new attempt
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("authToken"); // Ensure token is removed on fail
      })
      .addCase(logoutUser.pending,(state,action)=>{
        state.isAuthLoading = true;
        state.error = ""; // Clear error on new attempt
      })
      .addCase(logoutUser.fulfilled,(state,action)=>{
        state.user = null;
        state.isAuth = false;
        state.error = "";
        state.isAuthLoading = false;
      })
      .addCase(logoutUser.rejected,(state,action)=>{
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
