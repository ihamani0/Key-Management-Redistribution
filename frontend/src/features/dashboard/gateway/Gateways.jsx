// GatewaysPage.jsx
import React, { useEffect, useState } from "react";

import RegisterGateway from "./RegisterGateway";
import GatewayList from "./GatewayList";
import SearchBar from "@/ui/SearchBar";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchGatewayAll,
  createGateway,
  deleteGateway,
  selectGatewayList,
  selectGatewayLoading,
  selectGatewayCreating,
  selectGatewayError,
} from "./gatewaySlice";
import {
  fetchSubariaAll,
  selectSubariaList,
} from "../subaria/subariaSlice";
import ErrorMessage from "@/ui/ErrorMessage";


function GatewaysPage() {

  const dispatch = useDispatch();


    // Redux selectors
  const gatewayList = useSelector(selectGatewayList) || [];
  const loading = useSelector(selectGatewayLoading);
  const creating = useSelector(selectGatewayCreating);
  const error = useSelector(selectGatewayError);
  const subariaList = useSelector(selectSubariaList) || [];




  const [searchTerm, setSearchTerm] = useState("");


    // Prepare subaria options for select
  const subariaOptions = subariaList.map((s) => ({
    id: s.id?.toString(),
    name: s.subsetName,
  }));



  // Fetch gateways and subaria on mount
  useEffect(() => {
    dispatch(fetchGatewayAll());
    dispatch(fetchSubariaAll());
  }, [dispatch]);




  const handleRegister = (newGateway) => {
    dispatch(createGateway(newGateway));
  };

  // Delete gateway
  const handleRemove = (gateway) => {
    dispatch(deleteGateway(gateway.id));
  };

  const filteredGateway = gatewayList.filter(
    (gateway) =>
      (gateway.gatewayName.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (gateway.gatewayGuid.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if(error){
      return <ErrorMessage message={error} />
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        
        <SearchBar 
          placeholder="Search Gateway by name or ID..."
          value={searchTerm}
          onChange={setSearchTerm}
          ariaLabel="Search Subaria"
        />

        {/* Register Gateway Button */}
        <RegisterGateway 
          onRegister={handleRegister} 
          subariaOptions={subariaOptions}
          creating={creating}
                 />
      </div>

      {/* Gateway List */}
      <div className="mt-6 px-6 py-4">
        <GatewayList gatewayList={filteredGateway} 
        loading={loading}
        onRemove={handleRemove}/>
      </div>
    </div>
  );
}

export default GatewaysPage;