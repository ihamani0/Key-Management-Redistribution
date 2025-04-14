import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import { LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const styleButton =
    "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700";
  return (
    <div className="block">
      <button
        type="button"
        className={styleButton}
        onClick={() => {
          dispatch(logoutUser());
          navigate("/login");
        }}
      >
        <LogOutIcon />
      </button>
    </div>
  );
}

export default Logout;
