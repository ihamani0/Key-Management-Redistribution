import { Network } from "lucide-react";
import React from "react";

function DashboardHome() {
  return (
    <div className="container px-4 py-6">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Connected Devices</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <Network className="w-8 h-8 text-gray-700" />
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default DashboardHome;
