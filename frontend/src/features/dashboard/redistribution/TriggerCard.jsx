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
import { Send } from "lucide-react";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

function TriggerCard({ devices, loadingDevices }) {
  const [selectedManualTarget, setSelectedManualTarget] = useState("All");

  const [isTriggerConfirmOpen, setIsTriggerConfirmOpen] = useState(false);

  // Trigger manual redistribution
  const handleTriggerRedistribution = async () => {
    setIsTriggerConfirmOpen(false); // Close dialog
    try {
      //   await triggerRedistribution(selectedManualTarget);
      //   toast({ title: "Success", description: "Key redistribution triggered." });

      toast.success("Success", {
        description: "Trigger key for device",
        duration: 6000,
        action: {
          label: "undo",
          className: "text-red-500 hover:text-red-700",
        },
      });

      //   // Refresh history
      //   const updatedHistory = await fetchRedistributionHistory();
      //   setHistory(updatedHistory);
    } catch (error) {
      //   console.error("Trigger failed:", error);
      //   toast({ title: "Error", description: "Failed to trigger redistribution.", variant: "destructive" });
      toast("Error", {
        description: "Failed to trigger redistribution.",
        action: {
          label: "Undo",
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Send className="mr-2 inline-block h-5 w-5" />{" "}
          <span className="text-2xl font-bold">
            Manual Key Redistribution
          </span>
        </CardTitle>
        <CardDescription>Trigger redistribution now.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full space-y-2">
            <Label htmlFor="manualTarget">Target Devices</Label>
            <Select
              value={selectedManualTarget}
              onValueChange={setSelectedManualTarget}
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
                  devices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.deviceName} ({device.deviceId})
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
                <Send className="mr-2 h-4 w-4" /> Trigger Now
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Trigger</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to trigger redistribution for{" "}
                  <strong>
                    {selectedManualTarget === "All"
                      ? "All Devices"
                      : selectedManualTarget}
                  </strong>
                  ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTriggerRedistribution}>
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

export default TriggerCard;
