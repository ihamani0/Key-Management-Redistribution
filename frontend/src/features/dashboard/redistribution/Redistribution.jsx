/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import TriggerCard from "./TriggerCard";
import SchedulCard from "./SchedulCard";
import RedistributionHistory from "./RedistributionHistory";

function Redistribution() {
  const [devices, setDevices] = useState([]); // List of devices

  const [loadingDevices, setLoadingDevices] = useState(false); // List of devices


  const [history, setHistory] = useState([]);  // History of Redistribution devices 
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDevices([
        { deviceId: "1", deviceName: "Device A" },
        { deviceId: "2", deviceName: "Device B" },
      ]);
      setLoadingDevices(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);


 
  // // Load history and devices on page load
  //  useEffect(() => {
  //   const loadData = async () => {
  //     setLoadingHistory(true);
  //     setLoadingDevices(true);
  //     try {
  //       const [fetchedHistory, fetchedDevices] = await Promise.all([
  //         fetchRedistributionHistory(),
  //         fetchDevices()
  //       ]);
  //       setHistory(fetchedHistory);
  //       setDevices(fetchedDevices);
  //     } catch (error) {
  //       console.error("Failed to load data:", error);
  //       toast({
  //         title: "Error",
  //         description: "Could not load history or devices.",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setLoadingHistory(false);
  //       setLoadingDevices(false);
  //     }
  //   };
  //   loadData();
  // }, [toast]);



  return (
    <div className="px-6 py-4 mt-4 flex flex-col space-y-10">
      {/* === Trigger Section === */}
      <TriggerCard devices={devices} loadingDevices={loadingDevices} />

      {/* === Scheduling Section === */}

      <SchedulCard devices={devices} loadingDevices={loadingDevices} />

      {/* Redistribution History */}

      <RedistributionHistory />
    </div>
  );
}

export default Redistribution;
