/* eslint-disable no-unused-vars */

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, ShieldX } from "lucide-react";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function RevockCard(
{ 
  selectedSubaria,
  //
  onTriggerRevocked, // Function to handle redistribution trigger
  //devices 
  deviceList,
  loadingDevices,
  selectedDevice,
  setSelectedDevice,
}

) {
  
  const [isTriggerConfirmOpen , setIsTriggerConfirmOpen] = useState(false);



  const handleRevocked = ()=>{
    if(!selectedDevice || selectedDevice === "All") {
      toast.error("Please select a target device.");
      return;
    }
    setIsTriggerConfirmOpen(false);
    onTriggerRevocked(selectedDevice);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
           <ShieldX   className="mr-2 inline-block h-5 w-5" />{" "}
          <span className="text-2xl font-bold">
            Revocked Device
          </span>
        </CardTitle>
        <CardDescription>Revocked  now.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col   gap-4 items-end">
          

           <div className="w-full space-y-2">
            <Label htmlFor="manualTarget">Target Devices</Label>
            <Select
              value={selectedDevice}
              onValueChange={setSelectedDevice}
              disabled={selectedSubaria ? false : true}
            >
              <SelectTrigger id="manualTarget" className="w-full">
                <SelectValue placeholder="Select target..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Devices</SelectItem>

                {loadingDevices ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  deviceList.map((device) => (
                    <SelectItem key={device.deviceGuid} value={device.deviceGuid}>
                      {device.deviceName}{" "}--{" "}({device.deviceGuid})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div> 

           <AlertDialog
            open={isTriggerConfirmOpen}
            onOpenChange={setIsTriggerConfirmOpen}
          >
            <AlertDialogTrigger asChild>
              <Button disabled={loadingDevices}>
                <Send className="mr-2 h-4 w-4" /> Revocked Now
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Trigger</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to trigger provision for Device {" "}
                  <strong>
                    {selectedDevice === "All"
                      ? "All Devices"
                      : selectedDevice}
                  </strong>
                  ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevocked}>
                  Yes, Trigger Now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> 
        </div>
      </CardContent>
    </Card>
  );
}

export default RevockCard;
