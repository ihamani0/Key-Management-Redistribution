import NavBar from "../../components/dashboard/NavBar";
import { Key, Network } from "lucide-react";
import SideBar from "../../components/SideBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  // Function to toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      <main className="lg:ms-72">
        <NavBar toggleSidebar={toggleSidebar} />

        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}

export default DashboardPage;
