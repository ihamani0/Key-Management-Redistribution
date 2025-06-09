import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Thunk to fetch devices by subaria
export const fetchDevicesBySubaria = createAsyncThunk(
    "task/fetch-devices-by-subaria",
    async (subariaId, { rejectWithValue }) => {
        try {
            return await api.get(`/device/${subariaId}/subset`);
             
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetechAllTasks = createAsyncThunk(
    "task/fetch-all-tasks",
    async (_, { rejectWithValue }) => {
        try {
            return await api.get(`/task/all`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


//=========================================


export const provisionDevice = createAsyncThunk(
    "task/provision-devices",
    async (deviceGuid, { rejectWithValue }) => {
        try {
            return await api.post(`/device/${deviceGuid}/provision`);
             
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

//=========================================
export const  refreshingDevice = createAsyncThunk(
    "task/refreshing-devices",
    async (deviceGuid, { rejectWithValue }) => {
        try {
            return await api.post(`/device/${deviceGuid}/refresh-pairwise`);
             
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const revockingDevice = createAsyncThunk(
    "task/revocking-devices",
    async (deviceGuid, { rejectWithValue }) => {
        try {
            return await api.post(`/device/${deviceGuid}/revoke`);
             
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);  

export const schedulingDevice = createAsyncThunk(
    "task/scheduling-devices", 
    async (data, { rejectWithValue }) => {
        try {
            const { subsetId, scheduleType, scheduleValue, deviceId, recurrence } = data;
            return await api.post(`/task/schedule`, {
                subsetId,
                scheduleType,
                scheduleValue,
                deviceId,
                recurrence
            });
             
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);



const initialState = {
    devices: [],
    tasksList: [],
    loading: false,
    error: null,
    provising : false,
    revocking : false ,
    scheduling : false,
    refreshing : false,
    message : ""
};

const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {

        clearDeviceList: (state) => {
            state.devices = []; // Add this reducer
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDevicesBySubaria.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDevicesBySubaria.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = action.payload.data || [];
                state.error = null;
            })
            .addCase(fetchDevicesBySubaria.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch devices by subaria";
            })
            //==============================================================
            .addCase(fetechAllTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetechAllTasks.fulfilled, (state, action) => {
                state.loading = false;
                // Assuming the payload contains an array of tasks
                state.tasksList = action.payload.data || [];
                state.error = null;
            })
            .addCase(fetechAllTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch all tasks";
            })
            //==============================================================
            .addCase(provisionDevice.pending, (state) => {
                state.provising = true;
                state.error = null;
            })
            .addCase(provisionDevice.fulfilled, (state,action) => {
                state.provising = false;
                state.message = action.payload.message
                state.tasksList.push(action.payload.data)
                // Optionally handle the provisioned device here
                state.error = null;
            })
            .addCase(provisionDevice.rejected, (state, action) => {
                state.provising = false;
                state.error = action.payload || "Failed to provision device";
            })
            //==============================================================
            .addCase(refreshingDevice.pending, (state) => {
                state.refreshing = true;
                state.error = null;
            })
            .addCase(refreshingDevice.fulfilled, (state, action) => {
                state.refreshing = false;
                state.message = action.payload.message
                // Optionally handle the refreshed device here
                state.error = null;
            })
            .addCase(refreshingDevice.rejected, (state, action) => {
                state.refreshing = false;
                state.error = action.payload || "Failed to refresh device";
            })
            //==============================================================
            .addCase(revockingDevice.pending, (state) => {
                state.revocking = true;
                state.error = null;
            })
            .addCase(revockingDevice.fulfilled, (state, action) => {
                state.revocking = false;
                state.message = action.payload.message
                // Optionally handle the revoked device here
                state.error = null;
            })
            .addCase(revockingDevice.rejected, (state, action) => {
                state.revocking = false;
                state.error = action.payload || "Failed to revoke device";
            });
    },
});

export const selectTaskDevices = (state) => state.task.devices || [];
export const selectTaskLoading = (state) => state.task.loading;
export const selectTaskError = (state) => state.task.error;

//belongs to tasks
export const selectTaskList = (state) => state.task.tasksList || [];
export const selectTaskListLoading = (state) => state.task.loading;
export const selectTaskListError = (state) => state.task.error;


export const selecteProvisingLoading = (state) =>state.task.provising ;
export const selecteMessage =  (state) => state.task.message ;

export const { clearDeviceList } = taskSlice.actions;

export default taskSlice.reducer;
