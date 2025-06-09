import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import subariaReducer from "@/features/dashboard/subaria/subariaSlice";
import gatewaysReducer from "@/features/dashboard/gateway/gatewaySlice";
import deviceReducer from "@/features/dashboard/devices/deviceSlice";
import taskReducer from "@/features/dashboard/redistribution/taskSlice";
import auditLogReducer from "@/features/dashboard/monitor/auditLogSlice";

export default configureStore({
  reducer: {
    auth: authReducer,
    subaria: subariaReducer,
    gateway : gatewaysReducer,
    device : deviceReducer,
    task : taskReducer,
    auditLogs : auditLogReducer
  },
});
