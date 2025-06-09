import React from "react";
import { Menu, Shield } from "lucide-react";
import { useLocation } from "react-router-dom";

function NavBar({ toggleSidebar }) {
  const { pathname } = useLocation();

  return (
    <nav className="bg-gray-50 text-gray-600 p-4 shadow ">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-xl font-bold">{getPageTitle(pathname)}</h1>
        </div>
      </div>

      <button
        className="lg:hidden fixed top-4 ltr:right-4 rtl:left-4 z-50 p-2 text-gray-600 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-lg  hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 space-x-2"
        onClick={toggleSidebar}
      >
        <Menu size={18} />
      </button>
    </nav>
  );
}

function getPageTitle(pathname) {
  switch (pathname) {
    case "/dashboard":
      return "Dashboard Overview";
    case "/dashboard/devices":
      return "Device Management";
    case "/dashboard/redistribution":
      return "Key Redistribution";
    case "/dashboard/monitoring":
      return "System Monitoring";
    case "/dashboard/subaria":
      return "Subaria Management";
    case "/dashboard/gateway":
      return "Gateway Management";
    default:
      return "SecureKey Manager";
  }
}

export default NavBar;
