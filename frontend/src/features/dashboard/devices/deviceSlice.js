import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Thunks
export const createDevice = createAsyncThunk(
    "device/create-device",
    async (newDevice, { rejectWithValue }) => {
        try {
            return await api.post("/device/create", newDevice);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDeviceAll = createAsyncThunk(
    "device/fetch-all",
    async (_, { rejectWithValue }) => {
        try {
            return await api.get("/device/all");
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteDevice = createAsyncThunk(
    "device/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/device/${id}/delete`);
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

const deviceSlice = createSlice({
    name: "device",
    initialState,
    reducers: {
        clearDeviceError: (state) => {
            state.error = "";
        },

    },
    extraReducers: (builder) => {
        builder
            // Create Device
            .addCase(createDevice.pending, (state) => {
                state.creating = true;
                state.error = "";
            })
            .addCase(createDevice.fulfilled, (state, action) => {
                state.creating = false;
                state.list.push(action.payload.data);
                state.error = "";
            })
            .addCase(createDevice.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || "Failed to create device";
            })
            // Fetch All Devices
            .addCase(fetchDeviceAll.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchDeviceAll.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data || [];
                state.error = "";
            })
            .addCase(fetchDeviceAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch devices";
            })
            // Delete Device
            .addCase(deleteDevice.pending, (state) => {
                state.deleting = true;
                state.error = "";
            })
            .addCase(deleteDevice.fulfilled, (state, action) => {
                state.deleting = false;
                state.list = state.list.filter(device => device.deviceId !== action.payload.id);
                state.error = "";
            })
            .addCase(deleteDevice.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || "Failed to delete device";
            })
 
    },
});

export const selectDeviceError = (state) => state.device.error;
export const selectDeviceList = (state) => state.device.list || [];
export const selectDeviceLoading = (state) => state.device.loading;
export const selectDeviceCreating = (state) => state.device.creating;
export const selectDeviceDeleting = (state) => state.device.deleting;

export const { clearDeviceError , clearDeviceList} = deviceSlice.actions;

export default deviceSlice.reducer;
