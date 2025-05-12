import React, { useState } from "react";
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

// import { useToast } from "@/hooks/use-toast";

function RegisterDevice() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  const [newDevice, setNewDevice] = useState({
    deviceId: "",
    deviceName: "",
    deviceType: "",
    gatwayId: "",
  });

  //   Placeholder handler for registering a new device

  const handleRegisterDevice = async (event) => {
    event.preventDefault();
    console.log("Registering device:", newDevice);
    // TODO: Add validation before calling API
    try {
      toast(`Device ${newDevice.deviceName} registered successfully.`);
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
          <DialogTitle>Register New IoT Device</DialogTitle>
          <DialogDescription>
            Enter the details for the new device. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegisterDevice}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deviceId" className="text-right">
                Device ID
              </Label>
              <Input
                id="deviceId"
                value={newDevice.deviceId}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, deviceId: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-2  gap-4">
              <Label htmlFor="deviceId" className="text-right">
                Gatway
              </Label>
              <Select
                onValueChange={(value) =>
                  setNewDevice({ ...newDevice, gatwayId: value })
                }
                value={newDevice.gatwayId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Gatway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GA">Gatway-A</SelectItem>
                  <SelectItem value="GB">Gatway-B</SelectItem>
                  <SelectItem value="GC">Gatway-C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Device</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterDevice;
