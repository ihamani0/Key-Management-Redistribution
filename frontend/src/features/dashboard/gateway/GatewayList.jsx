// GatewayList.jsx
import React, { useState } from "react";
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
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
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
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/ui/StatusBadge";

function GatewayList({ gatewayList, onRemove }) {
  const [gatewayToRemove, setGatewayToRemove] = useState(null);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);


  
  const handleViewDetails = (gateway) => {
    setSelectedGateway(gateway);
    setDetailsDialogOpen(true);
  };


  const handleRemoveGateway = () => {

    if(onRemove  && gatewayToRemove){
      onRemove(gatewayToRemove);

      toast(`${gatewayToRemove.gatewayName} has been removed.`);
      setGatewayToRemove(null);
    };
  }

  return (
    <Card className="shadow-sm px-4 py-6">
      <CardContent className="p-0">
        {gatewayList.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            No gateways found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gateway GUID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Public Key (truncated)</TableHead>
                <TableHead>Subaria ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gatewayList.map((gateway) => (
                <TableRow key={gateway.gatewayGuid}>
                  <TableCell className="font-mono text-xs">
                    {gateway.gatewayGuid}
                  </TableCell>
                  <TableCell className="font-medium">
                    {gateway.gatewayName}
                  </TableCell>
                  <TableCell>
                    {gateway.authenticationKeyPublic.substring(0, 20)}...
                  </TableCell>
                  <TableCell>{gateway.subset.subsetIdentifier}</TableCell>
                  <TableCell>
                    <StatusBadge status={gateway.status} />
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(gateway)}
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
                          onClick={() => setGatewayToRemove(gateway)}
                          aria-label="Remove Gateway"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the gateway{" "}
                            <span className="font-semibold">
                              {gateway.gatewayName} ({gateway.gatewayGuid})
                            </span>{" "}
                            and its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setGatewayToRemove(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRemoveGateway}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            Yes, Remove Gateway
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


      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gateway Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected gateway.
            </DialogDescription>
          </DialogHeader>
          {selectedGateway && (
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {selectedGateway.gatewayName}
              </div>
              <div>
                <strong>GUID:</strong> {selectedGateway.gatewayGuid}
              </div>
              <div>
                <strong>Public Key:</strong> <span className="break-all">{selectedGateway.authenticationKeyPublic}</span>
              </div>
              <div>
                <strong>Subaria ID:</strong> {selectedGateway.subset.subsetIdentifier}
              </div>
              <div>
                <strong>Status:</strong> <StatusBadge status={selectedGateway.status} />
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

export default GatewayList;