import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./assets/App.css";
import LoginPage from "./pages/LoginPage";
import Logout from "./components/Logout";
import GuestGuard from "./features/auth/GuestGuard";
import AuthGuard from "./features/auth/AuthGuard";
import NotFoundPage from "./pages/NotFoundPage";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, selecteIsAuthLoading } from "./features/auth/authSlice";
import Spinner from "./ui/Spinner";
import DashboardLayout from "./features/dashboard/Layout";
import Devices from "./features/dashboard/devices/Devices";
import DashboardHome from "./features/dashboard/DashboardHome";
import Redistribution from "./features/dashboard/redistribution/Redistribution";

import MonitoringDashboard from "./features/dashboard/monitor/MonitoringDashboard";

function App() {
  const isAuthLoading = useSelector(selecteIsAuthLoading);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },

    {
      path: "/dashboard",
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <DashboardHome />,
        },
        {
          path: "devices",
          element: <Devices />,
        },
        {
          path: "redistribution",
          element: <Redistribution />,
        },
        {
          path: "monitoring",
          element: <MonitoringDashboard />,
        },
      ],
    },
    {
      path: "/login",
      element: (
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      ),
    },
    {
      path: "/*",
      element: <NotFoundPage />,
    },
    {
      path: "/logout",
      element: <Logout />,
    },
  ]);

  return isAuthLoading ? <Spinner /> : <RouterProvider router={router} />;
}

export default App;
