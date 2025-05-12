/* eslint-disable no-unused-vars */
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import RegisterDevice from "./RegisterDevice";
import DeviceList from "./DeviceList";

const deviceList = [
  {
    deviceId: "SENSOR-TEMP-001",
    deviceName: "Living Room Temp",
    deviceType: "Temperature Sensor",
    status: "Online",
    lastCheckin: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  },
  {
    deviceId: "ACT-RELAY-002",
    deviceName: "Main Light Switch",
    deviceType: "Relay Switch",
    status: "Online",
    lastCheckin: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
  },
  {
    deviceId: "SENSOR-HUM-003",
    deviceName: "Basement Humidity",
    deviceType: "Humidity Sensor",
    status: "Offline",
    lastCheckin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    deviceId: "CAM-ENTRY-004",
    deviceName: "Front Door Cam",
    deviceType: "Camera",
    status: "Key-Expired",
    lastCheckin: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
  },
  {
    deviceId: "SENSOR-PIR-005",
    deviceName: "Hallway Motion",
    deviceType: "Motion Sensor",
    status: "Key-Valid",
    lastCheckin: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
  },
];

function Devices() {
  const [devices, setDevices] = useState(deviceList || []);
  // const [filteredDevices, setFilteredDevices] =useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  //  const [deviceToRemove, setDeviceToRemove] =useState(null);
  // const [loading, setLoading] =useState(true);

  // Compute filtered results during rendering
  const filteredDevices = searchTerm
    ? devices.filter(
        (device) =>
          device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : devices;

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* SearchBox */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search devices by name or ID..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search devices"
          />
        </div>

        {/* Register Device */}
        <RegisterDevice />
      </div>

      <div className="mt-6 px-6 py-4">
        <DeviceList deviceList={filteredDevices} />
      </div>
    </div>
  );
}

export default Devices;
