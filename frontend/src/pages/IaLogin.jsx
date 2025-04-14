import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, selectAuthLoading, selectAuthError, clearError } from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const from = location.state?.from?.pathname || "/home"; // Redirect back after login

   // Clear error when component mounts or user types
   useEffect(() => {
     dispatch(clearError());
   }, [dispatch]);


  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(clearError()); // Clear previous errors
    dispatch(loginUser({ email, password }))
      .unwrap() // Use unwrap to handle the promise directly here
      .then(() => {
        navigate(from, { replace: true }); // Redirect to intended page or home
      })
      .catch((err) => {
         // Error is already handled by the slice/rejected case,
         // but you could add specific UI updates here if needed.
         console.error("Login failed:", err);
      });
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); dispatch(clearError()); }} // Clear error on change
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => { setPassword(e.target.value); dispatch(clearError()); }} // Clear error on change
              required
               disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex justify-center items-center transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


//import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectIsAuthLoading } from './authSlice';
import LoadingSpinner from '../../components/LoadingSpinner'; // Assuming you have this

const AuthGuard = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthLoading = useSelector(selectIsAuthLoading); // Check if initial auth check is done
  const location = useLocation();

  if (isAuthLoading) {
    // Show a loading indicator while checking authentication status
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // Render the protected component if authenticated
};


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, registerAPI, logoutAPI, checkAuthAPI } from './authAPI';

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginAPI(credentials);
      return response; // { user: { email, name }, token }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerAPI(userData);
      return response; // { message: '...' } or { user, token } if auto-login
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

 export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutAPI();
      return {}; // No payload needed on success
    } catch (error) {
       // Even if API fails, force logout on client
      console.error("Logout API failed:", error);
      return {}; // Still proceed with client-side logout
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkAuthAPI();
      return response; // { user, token } or { user: null, token: null }
    } catch (error) {
      console.error("Check auth failed:", error);
      return rejectWithValue('Auth check failed'); // Or return state indicating logged out
    }
  }
);

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('authToken') || null, // Initialize token from storage
  isAuthenticated: false, // Will be updated by checkAuth or login
  isLoading: false, // For general loading state
  isAuthLoading: true, // Specific flag for initial auth check
  error: null,
  registrationMessage: null, // To show success message after registration
};

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Optional: Reducer to clear errors manually
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationMessage: (state) => {
      state.registrationMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Login failed';
         localStorage.removeItem('authToken'); // Ensure token is removed on fail
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // If API returns user/token (auto-login), update state accordingly
        if (action.payload.user && action.payload.token) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        } else {
            // Otherwise, just show the success message
            state.registrationMessage = action.payload.message || 'Registration successful!';
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
         state.isLoading = true; // Indicate activity during logout
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.registrationMessage = null;
        localStorage.removeItem('authToken'); // Ensure token removed
      })
       .addCase(logoutUser.rejected, (state) => {
        // Still log the user out on the client even if API fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = "Logout failed, but logged out locally."; // Optional error message
         state.registrationMessage = null;
        localStorage.removeItem('authToken'); // Ensure token removed
      })
      // Check Auth (Initial Load)
      .addCase(checkAuth.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload.user && action.payload.token) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        } else {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('authToken'); // Clean up if check fails
        }
        state.isAuthLoading = false; // Finished initial check
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isAuthLoading = false; // Finished initial check (failed)
         localStorage.removeItem('authToken'); // Clean up on error
      });
  },
});

// Export Actions and Reducer
export const { clearError, clearRegistrationMessage } = authSlice.actions;
export default authSlice.reducer;

// Selectors (optional but good practice)
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectRegistrationMessage = (state) => state.auth.registrationMessage;
export const selectIsAuthLoading = (state) => state.auth.isAuthLoading; // For initial load check




// Simulates network delay
const networkDelay = (ms) => new Promise(res => setTimeout(res, ms));

// Mock user database (in a real app, this is your backend database)
const mockUsers = {
  "test@example.com": { password: "password123", name: "Test User" }
};
let mockToken = null; // Simulate a session token





export const loginAPI = async (credentials) => {
  await networkDelay(1000); // Simulate API call time
  const user = mockUsers[credentials.email];
  if (user && user.password === credentials.password) {
    mockToken = `fake-jwt-token-${Date.now()}`; // Generate a simple fake token
    localStorage.setItem('authToken', mockToken); // Persist token
    return { user: { email: credentials.email, name: user.name }, token: mockToken };
  } else {
    throw new Error('Invalid credentials');
  }
};

export const registerAPI = async (userData) => {
    await networkDelay(1500);
    if (mockUsers[userData.email]) {
        throw new Error('Email already exists');
    }
    // In a real app: hash the password securely on the backend!
    mockUsers[userData.email] = { password: userData.password, name: userData.name || `User_${Date.now()}` };
    console.log("Mock User Registered:", mockUsers[userData.email]);
    // Optionally log in the user immediately after registration
    // For this example, we'll just return success
    return { message: 'Registration successful! Please log in.' };
    // Or to auto-login:
    // return loginAPI({ email: userData.email, password: userData.password });
};

export const checkAuthAPI = async () => {
    // Simulate checking if the token stored locally is valid
    await networkDelay(300);
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && storedToken === mockToken) {
        // In a real app, you'd verify the token with the backend
        // and get user details based on the token.
        // Here, we find the user based on the current mockToken (not robust)
        const userEmail = Object.keys(mockUsers).find(email => {
            // This simple check wouldn't work with real JWTs.
            // You'd decode the JWT or ask the backend.
            return true; // Assume token matches *some* user for demo
        });
         if (userEmail && mockUsers[userEmail]) {
            return { user: { email: userEmail, name: mockUsers[userEmail].name }, token: storedToken };
        }
    }
    localStorage.removeItem('authToken'); // Clean up invalid token
    mockToken = null;
    return { user: null, token: null }; // Indicate not authenticated
};




export const logoutAPI = async () => {
    await networkDelay(500);
    mockToken = null;
    localStorage.removeItem('authToken');
    return { message: 'Logout successful' };
};