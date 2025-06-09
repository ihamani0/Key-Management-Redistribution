// DeviceList.jsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";


import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/ui/StatusBadge";

function DeviceList({ deviceList , onRemove }) {
  const [deviceToRemove, setDeviceToRemove] = useState(null);

    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);



  const handleViewDetails = (device) => {
    setDetailsDialogOpen(true);
    setSelectedDevice(device);
  };

  const handleRemoveDevice = () => {

    if(onRemove && deviceToRemove){
      onRemove(deviceToRemove);
    }
    toast.success(`${deviceToRemove.deviceName} has been removed.`);
    setDeviceToRemove(null);
  };

  return (
    <Card className="shadow-sm px-4 py-6">
      <CardContent className="p-0">
        {deviceList.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            No devices found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Subaria ID</TableHead>
                <TableHead>Local ID</TableHead>
                <TableHead>Status</TableHead>
                
                <TableHead>Registered At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceList.map((device) => (
                <TableRow key={device.deviceGuid}>

                  <TableCell className="font-medium">
                    {device.deviceName}
                  </TableCell>

                  <TableCell>{device?.subset?.subsetIdentifier || "-"}</TableCell>


                  <TableCell className="font-mono text-xs">
                    {device.localIdentifierInSubset}
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge status={device.status} />
                  </TableCell>
                  {/* Registered At */}
                  <TableCell>
                    {device.registered_at
                      ? new Date(device.registered_at).toLocaleString()
                      : "-"}
                  </TableCell>


                  
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(device)}
                      aria-label="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeviceToRemove(device)}
                          aria-label="Remove Device"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            remove the device
                            <span className="font-semibold">
                              {" "}
                              {deviceToRemove?.deviceName} (
                              {deviceToRemove?.deviceId})
                            </span>{" "}
                            and its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setDeviceToRemove(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRemoveDevice}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            Yes, remove device
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>


      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gateway Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about the selected Device.
                  </DialogDescription>
                </DialogHeader>
                {selectedDevice && (
                  <div className="space-y-2">
                    <div>
                      <strong>Name:</strong> {selectedDevice.deviceName}
                    </div>
                    
                    <div>
                      <strong>Local ID:</strong> {selectedDevice.localIdentifierInSubset}
                    </div>
                    
                    <div>
                      <strong>GUID:</strong> {selectedDevice.deviceGuid}
                    </div>

                    <div>
                      <strong>Type:</strong> {selectedDevice.deviceType}
                    </div>

                    <div>
                      <strong>Subaria ID:</strong> {selectedDevice?.subset?.subsetIdentifier}
                    </div>

                    <div>
                      <strong>Gateways in Subaria (ID):</strong> {selectedDevice?.subset.gateways?.map(gw => gw.gatewayGuid).join(", ") || "-"}
                    </div>

                    <div>
                      <strong>Status:</strong> 
                      <StatusBadge status={selectedDevice.status} />
                      
                    </div>

                    {/* Add more fields as needed */}
                  </div>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </Card>
  );
}

export default DeviceList;