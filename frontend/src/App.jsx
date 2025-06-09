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

import Monitoring from "./features/dashboard/monitor/Monitoring";
import Subarias from "./features/dashboard/subaria/Subarias";
import Gateways from "./features/dashboard/gateway/Gateways";
import LandingPage from "./pages/LandingPage";


// import ReactFlow from "./features/dashboard/SystemFlowChart";

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
          path: "subaria",
          element: <Subarias />,
        },
        {
          path: "gateway",
          element: <Gateways />,
        },
        {
          path: "devices",
          element: <Devices />,
        },

        {
          path: "key-management",
          element: <Redistribution />,
        },
        {
          path: "monitoring",
          element: <Monitoring/>,
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
      path: "/landing-page",
      element: <LandingPage />,
    },

  ]);

  return isAuthLoading ? <Spinner /> : <RouterProvider router={router} />;
}

export default App;
