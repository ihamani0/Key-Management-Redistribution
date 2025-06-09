import React, { useState , useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import RegisterSubaria from "./RegisterSubaria";
import SubariaList from "./SubariaList";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubariaAll,
  createSubaria,
  deleteSubaria,
  selectSubariaList,
  selectSubariaLoading,
  selectSubariaCreating,
  selectSubariaError,
} from "./subariaSlice";
import Alert from "@/ui/Alert";
import ErrorMessage from "@/ui/ErrorMessage";
import SearchBar from "@/ui/SearchBar";


function SubariasPage() {

  const dispatch = useDispatch();
  
  //from subaria Slice 
  const subariaList = useSelector(selectSubariaList) || [];
  const loading = useSelector(selectSubariaLoading);
  const creating = useSelector(selectSubariaCreating);
  const error = useSelector(selectSubariaError);


  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    dispatch(fetchSubariaAll());
  }, [dispatch]);

  const handleRegisterSubaria = (newSubaria) => {
    dispatch(createSubaria(newSubaria));
  };

  const handleRemoveSubaria = (subaria) => {
    // Use subaria.id or subaria.subsetIdentifier depending on your backend
    dispatch(deleteSubaria(subaria.id));
  };

  const filteredSubaria = subariaList.filter(
    (subaria) =>
      subaria.subsetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subaria.subsetIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if(error){
      return <ErrorMessage message={error} />
  }

  return (



    <div className="container px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Box */}
        <SearchBar 
        placeholder="Search Subaria by name or ID..."
        value={searchTerm}
        onChange={setSearchTerm}
        ariaLabel="Search Subaria"
        />
        {/* Register Subaria Button */}
        <RegisterSubaria onRegister={handleRegisterSubaria} 
        creating={creating}
        />
      </div>





      {/* Subaria List */}
      <div className="mt-6 px-6 py-4">
        <SubariaList subariaList={filteredSubaria} 
        loading={loading}
        onRemove={handleRemoveSubaria}
        />
      </div>
    </div>
  );
}

export default SubariasPage;