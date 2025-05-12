import {
  Activity,
  KeyRound,
  LayoutDashboard,
  Smartphone,
  X,
} from "lucide-react";
import React from "react";

import { NavLink } from "react-router-dom";
function SideBar({ isSidebarOpen, closeSidebar }) {
  const navItems = [
    {
      name: "Dashboard",
      id: "dashboard",
      to: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Devices",
      id: "devices",
      to: "devices",
      icon: <Smartphone size={20} />,
    },
    {
      name: "Key Redistribution",
      id: "key_edistribution",
      to: "redistribution",
      icon: <KeyRound size={20} />,
    },
    {
      name: "Monitor",
      id: "monitor",
      to: "monitoring",
      icon: <Activity size={20} />,
    },
  ];

  return (
    <div
      className={`fixed top-0 left-0 rtl:right-0 z-40 w-80 lg:w-72  h-screen transition-transform  lg:translate-x-0 bg-gray-100 shadow-lg dark:bg-gray-950 dark:bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.05)_0%,transparent_80%)] rtl:font-mada ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full "
      }   `}
    >
      <button
        onClick={closeSidebar}
        className="absolute top-4 ltr:right-4 rtl:left-4 p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
        aria-label="Close sidebar"
      >
        <X size={18} />
      </button>

      <div className="h-full px-4 py-6 overflow-y-auto scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-50 ">
        <hr className="h-px my-8 bg-gray-300 border-0 dark:bg-gray-700"></hr>

        <ul className="space-y-3  md:font-medium my-3">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center w-full p-1 md:p-3 rounded-lg text-gray-800 dark:text-my-light hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 ${
                  isActive ? "bg-gray-300 dark:bg-gray-800" : ""
                }`
              }
            >
              {item.icon}
              <span className="ms-4 text-xs md:text-base">{item.name}</span>
            </NavLink>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
