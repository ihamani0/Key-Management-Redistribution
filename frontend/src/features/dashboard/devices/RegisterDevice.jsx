// RegisterDevice.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

function RegisterDevice({ onRegister, subariaOptions , creating }) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    localIdentifierInSubset: "",
    deviceName: "",
    deviceType: "",
    subsetId: ""
  });

  const handleRegisterDevice = async (event) => {
    event.preventDefault();
      
    if (onRegister) onRegister(newDevice);


    try {
      toast(`Device ${newDevice.deviceName} registered successfully.`);
      setNewDevice({
        localIdentifierInSubset: "",
        deviceName: "",
        deviceType: "",
        subsetId: ""
      });
      setIsRegisterDialogOpen(false);
    } catch (error) {
      console.error("Failed to register device:", error);
      toast("Failed to register the device.");
    }
  };


  
  return (
    <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>
            Enter the device details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegisterDevice}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="deviceId" className="text-right">
                local Identifier In Subset (must be unique)
              </Label>
              <Input
                id="deviceId"
                value={newDevice.deviceId}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, localIdentifierInSubset: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="deviceName" className="text-right">
                Device Name
              </Label>
              <Input
                id="deviceName"
                value={newDevice.deviceName}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, deviceName: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="deviceType" className="text-right">
                Device Type
              </Label>
              <Input
                id="deviceType"
                value={newDevice.deviceType}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, deviceType: e.target.value })
                }
                className="col-span-3"
                placeholder="e.g., Sensor, Actuator"
                required
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="subariaId" className="text-right">
                Subaria ID
              </Label>
              <Select
                onValueChange={(value) => setNewDevice({ ...newDevice, subsetId: value })}
                value={newDevice.subsetId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Subaria ID" />
                </SelectTrigger>
                <SelectContent>
                  {subariaOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit"
              disabled={creating}
            >{creating ? "...Saving" :"Save Device"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterDevice;