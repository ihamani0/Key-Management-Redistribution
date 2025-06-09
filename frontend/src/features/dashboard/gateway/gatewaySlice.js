import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Thunks
export const createGateway = createAsyncThunk(
    "gateway/create-gateway",
    async (newGateway, { rejectWithValue }) => {
        try {
            return await api.post("/gateway/create", newGateway);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGatewayAll = createAsyncThunk(
    "gateway/fetch-all",
    async (_, { rejectWithValue }) => {
        try {
            return await api.get("/gateway/all");
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteGateway = createAsyncThunk(
    "gateway/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/gateway/${id}/delete`);

            return { id };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    list: [],
    loading: false,
    error: null,
    creating: false,
    deleting: false,
};

const gatewaySlice = createSlice({
    name: "gateway",
    initialState,
    reducers: {
        clearGatewayError: (state) => {
            state.error = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Gateway
            .addCase(createGateway.pending, (state) => {
                state.creating = true;
                state.error = "";
            })
            .addCase(createGateway.fulfilled, (state, action) => {
                state.creating = false;
                state.list.push(action.payload.data);
                state.error = "";
            })
            .addCase(createGateway.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || "Failed to create gateway";
            })
            // Fetch All Gateways
            .addCase(fetchGatewayAll.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchGatewayAll.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data || [];
                state.error = "";
            })
            .addCase(fetchGatewayAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch gateways";
            })
            // Delete Gateway
            .addCase(deleteGateway.pending, (state) => {
                state.deleting = true;
                state.error = "";
            })
            .addCase(deleteGateway.fulfilled, (state, action) => {
                state.deleting = false;
                state.list = state.list.filter(gateway => gateway.id !== action.payload.id);
                state.error = "";
            })
            .addCase(deleteGateway.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || "Failed to delete gateway";
            });
    },
});

export const selectGatewayError = (state) => state.gateway.error;
export const selectGatewayList = (state) => state.gateway.list || [];
export const selectGatewayLoading = (state) => state.gateway.loading;
export const selectGatewayCreating = (state) => state.gateway.creating;
export const selectGatewayDeleting = (state) => state.gateway.deleting;

export const { clearGatewayError } = gatewaySlice.actions;

export default gatewaySlice.reducer;
