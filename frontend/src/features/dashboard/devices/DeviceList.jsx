/* eslint-disable no-unused-vars */
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
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function DeviceList({deviceList}) {
  const [loading, setLoading] = useState(true);

  const [deviceToRemove, setDeviceToRemove] = useState(null);

  

  // Placeholder handler for viewing device details (optional)
  const handleViewDetails = (device) => {
    console.log("Viewing details for:", device.deviceId);
    // TODO: Implement view details modal or navigation

    toast("View Device Details", {
      description: `Viewing details for ${device.deviceName}.`,
      action: {
        label: "Undo",
      },
    });
  };

  const handleRemoveDevice = (device) => {
    toast("Remove Device ", {
      description: `Viewing details for ${device.deviceName} .`,
      action: {
        label: "Undo",
      },
    });
  };

  return (
    <Card className="shadow-sm px-4 py-6">
      <CardContent className="p-0">
        {loading.length > 0 ? (
          <p className="p-6 text-center">Loading devices...</p>
        ) : deviceList.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            No devices found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Type</TableHead>
                {/* <TableHead>Status</TableHead> */}
                {/* <TableHead>Last Check-in</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceList.map((device) => (
                <TableRow key={device.deviceId}>
                  <TableCell className="font-mono text-xs">
                    {device.deviceId}
                  </TableCell>
                  <TableCell className="font-medium">
                    {device.deviceName}
                  </TableCell>
                  <TableCell>{device.deviceType}</TableCell>

                  {/* <TableCell>
                    <Badge variant={getStatusVariant(device.status)}>
                      {device.status}
                    </Badge>
                  </TableCell> */}

                  {/* <TableCell className="text-sm text-muted-foreground">
                    {new Date(device.lastCheckin).toLocaleString()}
                  </TableCell> */}

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
                            className="bg-destructive hover:bg-destructive/90 text-gray-50 "
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
    </Card>
  );
}

export default DeviceList;
