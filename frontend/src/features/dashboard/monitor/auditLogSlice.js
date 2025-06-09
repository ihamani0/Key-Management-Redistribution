import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";


// Thunk to fetch audit logs with filters
export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetch",
  async (params, { rejectWithValue }) => {
    try {
      return await api.get("/audit/logs", { params });
      
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



const initialState = {
    logs: [],
    total: 0,
    loading: false,
    error: null,

    filters: {
      table: "",
      action: "",
      userId: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
      pageSize: 10,
      query: "",
    },
  }


const auditLogSlice = createSlice({
    name: "auditLogs",

    initialState,

    reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },

    extraReducers: (builder) => {
        builder
        .addCase(fetchAuditLogs.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAuditLogs.fulfilled, (state, action) => {
            state.loading = false;
            state.logs = action.payload.data || [];
            state.total = action.payload.totalItems || 0;
            state.pageSize = action.payload.pageSize ? Number(action.payload.pageSize) : 10;
            state.currentPage = action.payload.currentPage ? Number(action.payload.currentPage) : 1;
        })
        .addCase(fetchAuditLogs.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch audit logs";
        });
    },
});


export const { setFilters } = auditLogSlice.actions;
export default auditLogSlice.reducer;