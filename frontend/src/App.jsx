import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./assets/App.css";
import LoginPage from "./pages/LoginPage";
import Logout from "./components/Logout";
import GuestGuard from "./features/auth/GuestGuard";
import AuthGuard from "./features/auth/authGuard";
import NotFoundPage from "./pages/NotFoundPage";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, selecteIsAuthLoading } from "./features/auth/authSlice";
import Spinner from "./ui/Spinner";

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
          <div>dashboard</div>
        </AuthGuard>
      ),
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
