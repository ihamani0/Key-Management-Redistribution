// Devices.jsx

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import RegisterDevice from "./RegisterDevice";
import DeviceList from "./DeviceList";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeviceAll,
  createDevice,
  deleteDevice,
  selectDeviceList,
  selectDeviceLoading,
  selectDeviceCreating,
  selectDeviceError,
} from "./deviceSlice";
import { fetchSubariaAll, selectSubariaList } from "../subaria/subariaSlice";
import ErrorMessage from "@/ui/ErrorMessage";
import { toast } from "sonner";
import SearchBar from "@/ui/SearchBar";

function Devices() {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  // Redux selectors
  const deviceList = useSelector(selectDeviceList) || [];
  const loading = useSelector(selectDeviceLoading);
  const creating = useSelector(selectDeviceCreating);
  const error = useSelector(selectDeviceError);
  const subariaList = useSelector(selectSubariaList) || [];

  useEffect(() => {
    dispatch(fetchDeviceAll());
    dispatch(fetchSubariaAll());
  }, [dispatch]);

  // Prepare subaria options for select
  const subariaOptions = subariaList.map((s) => ({
    id: s.id?.toString(),
    name: s.subsetName,
  }));

  // Register device
  const handleRegister = (newDevice) => {
    dispatch(createDevice(newDevice));
  };

  // Delete device
  const handleRemove = (device) => {
    if(!device.deviceId) return toast.error("Device ID is missing.");
    dispatch(deleteDevice(device.deviceId));
  };

  // Filtered list
  const filteredDevices = deviceList.filter(
    (device) =>
      (device.deviceName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (device.localIdentifierInSubset?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  if(error){
    return <ErrorMessage message={error} />
  }
  return (
    <div className="container px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* SearchBox */}
        
         <SearchBar 
          placeholder="Search Device by name or ID..."
          value={searchTerm}
          onChange={setSearchTerm}
          ariaLabel="Search Subaria"
          />

        {/* Register Device */}
        <RegisterDevice
          onRegister={handleRegister}
          subariaOptions={subariaOptions}
          creating={creating}
        />
      </div>

      <div className="mt-6 px-6 py-4">
        <DeviceList
          deviceList={filteredDevices}
          loading={loading}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}

export default Devices;
