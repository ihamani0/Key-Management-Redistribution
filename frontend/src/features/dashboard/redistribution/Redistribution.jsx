
import React, { useEffect, useState } from "react";
import TriggerCard from "./TriggerCard";
import SchedulCard from "./SchedulCard";
import RedistributionHistory from "./RedistributionHistory";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSubariaAll,
  selectSubariaList,
  selectSubariaLoading,
} from "../subaria/subariaSlice";



import {
  clearDeviceList,
  selectTaskDevices,
  selectTaskLoading,
  selectTaskError,
  fetchDevicesBySubaria,

  selectTaskList,
  selectTaskListLoading,
  selectTaskListError,

  fetechAllTasks,
  provisionDevice,
  refreshingDevice,
  revockingDevice,

  selecteProvisingLoading,
  selecteMessage,
  schedulingDevice
} from "./taskSlice";
import { toast } from "sonner";
import RefreshCard from "./RefreshCard";
import RevockCard from "./RevockCard";
import SubariaCard from "./SubariaCard";

function Redistribution() {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  


  const [selectedSubaria, setSelectedSubaria] = useState(null);


 

  const [selectedDeviceTrigger, setSelectedDeviceTrigger] = useState(null);
  const [selectedDeviceRefresh, setSelectedDeviceRefresh] = useState(null);
  const [selectedDeviceRevock, setSelectedDeviceRevock] = useState(null);



  // Redux selectors Subarias
  const subariaList = useSelector(selectSubariaList) || []; // List of subaria
  const loadingSubaria = useSelector(selectSubariaLoading);

  // Redux selectors Devices
  const deviceList = useSelector(selectTaskDevices) || []; // List of devices
  const loadingDevices = useSelector(selectTaskLoading);

  //task list 
  const taskList = useSelector(selectTaskList) || []; // List of tasks
  const taskListLoading = useSelector(selectTaskListLoading);
  const taskListError = useSelector(selectTaskListError);


  //
  const provising = useSelector(selecteProvisingLoading);
  const messageResponse = useSelector(selecteMessage);


  const taskError = useSelector(selectTaskError); // Already defined above

  useEffect(() => {
    if (messageResponse) {
      toast.success(messageResponse);
    } else if (taskError) {
      toast.error(taskError);
    }
  }, [messageResponse, taskError]);

  useEffect(() => {
    // Fetch all subaria when component mounts
    dispatch(fetchSubariaAll());
    dispatch(fetechAllTasks());
  }, [dispatch]);


  useEffect(() => {
    if (
      selectedSubaria &&
      selectedSubaria !== "All" &&
      !loadingSubaria 
    ) {
      dispatch(fetchDevicesBySubaria(selectedSubaria)); 
      // Reset device selection when subaria changes
    } else {
      dispatch(clearDeviceList());
    }
  }, [selectedSubaria, dispatch , loadingSubaria]);




    // Filtered list
  const filteredTaskList = taskList.filter(
    (task) =>
      (task.taskType?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) 
  );



  const onTrigger = (deviceGuid) => {

    dispatch(provisionDevice(deviceGuid))
  };

  const onRotation = (deviceGuid) => {

    dispatch(refreshingDevice(deviceGuid))
  };

  const onRevocked = (deviceGuid) => {

    dispatch(revockingDevice(deviceGuid))
  };

  const onScheduleing = (data) => {

    dispatch(schedulingDevice(data));

  }


  return (
    <div className="px-6 py-4 mt-4 flex flex-col space-y-10">
      {/* === Trigger Section === */}

      <div className="px-6 py-4 mt-4 grid grid-cols-2 gap-10 ">

      {/* Subaria Selection Card */}
      <SubariaCard 
        subariaList={subariaList}
        selectedSubaria={selectedSubaria}
        setSelectedSubaria={setSelectedSubaria}
        loadingSubaria={loadingSubaria}
      />

      <TriggerCard
        onTriggerRedistribution={onTrigger}
        selectedSubaria={selectedSubaria}
        deviceList={deviceList}
        loadingDevices={loadingDevices}
        selectedDevice={selectedDeviceTrigger}
        setSelectedDevice={setSelectedDeviceTrigger}
        provising={provising}
      />


      {/* Refresh ||Rotation */}
      <RefreshCard
        onTriggerRotation={onRotation}
        selectedSubaria={selectedSubaria}
        deviceList={deviceList}
        loadingDevices={loadingDevices}
        selectedDevice={selectedDeviceRefresh}
        setSelectedDevice={setSelectedDeviceRefresh}
        provising={provising}
      />

      {/* Revocked  */}
      <RevockCard
        onTriggerRevocked={onRevocked}
        selectedSubaria={selectedSubaria}
        deviceList={deviceList}
        loadingDevices={loadingDevices}
        selectedDevice={selectedDeviceRevock}
        setSelectedDevice={setSelectedDeviceRevock}
        provising={provising}
      />

      </div>


      {/* === Scheduling Section === */}

      <SchedulCard  
      
        onTriggerScheduleing={onScheduleing}
        selectedSubaria={selectedSubaria}
        deviceList={deviceList}
        loadingDevices={loadingDevices}

      />

      {/* Redistribution History */}

      <RedistributionHistory 
      taskList={filteredTaskList}  
      taskListLoading={taskListLoading} 
      taskListError={taskListError} 
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      />
    </div>
  );
}

export default Redistribution;
