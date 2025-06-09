import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";




export const createSubaria = createAsyncThunk(
    "subaria/create-subaria",
    async( newSubaria , { rejectWithValue }) => {
        try {
            return await api.post("/subaria/create" , newSubaria);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const fetchSubariaAll = createAsyncThunk(
    "subaria/fetch-All",
    async(_ , { rejectWithValue }) => {
        try {
            return await api.get("/subaria/all");
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteSubaria = createAsyncThunk(
  'subaria/delete',
  async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/subaria/${id}/delete`);
      return { id };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const initialState = {
    list: [],
    loading: false,
    error: null,
    creating: false,
    deleting: false
}

const subariaSlice = createSlice({
    name: "subaria",
    initialState,
    reducers: {
        clearSubariaError: (state) => {
            state.error = "";
        },
    },
    extraReducers:(builder) => {
        builder
            // Create Subaria
            .addCase(createSubaria.pending, (state) => {
                state.creating = true;
                state.error = ""; // Clear error on new attempt
            })
            .addCase(createSubaria.fulfilled, (state, action) => {
                state.creating = false;
                state.list.push(action.payload.data);
                state.error = ""; // Clear error on new attempt
            })
            .addCase(createSubaria.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || "Failed to create subaria";
            })
            // Fetch All Subaria
            .addCase(fetchSubariaAll.pending, (state) => {
                state.loading = true;
                state.error = ""; // Clear error on new attempt
            })
            .addCase(fetchSubariaAll.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data; // Assuming the response contains an array of subaria
                state.error = ""; // Clear error on new attempt
            })
            .addCase(fetchSubariaAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch subaria";
            })
            // Delete Subaria
            .addCase(deleteSubaria.pending, (state) => {
                state.deleting = true;
                state.error = ""; // Clear error on new attempt
            })
            .addCase(deleteSubaria.fulfilled, (state, action) => {
                state.deleting = false;
                state.list = state.list.filter(subaria => subaria.id !== action.payload.id); 
                state.error = ""; // Clear error on new attempt
            })
            .addCase(deleteSubaria.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload || "Failed to delete subaria";
            });
    }
})


export const selectSubariaError = (state) => state.subaria.error;
export const selectSubariaList = (state) => state.subaria.list || [];
export const selectSubariaLoading = (state) => state.subaria.loading;
export const selectSubariaCreating = (state) => state.subaria.creating;
export const selectSubariaDeleting = (state) => state.subaria.deleting;

export const { clearSubariaError } = subariaSlice.actions;

export default subariaSlice.reducer;

