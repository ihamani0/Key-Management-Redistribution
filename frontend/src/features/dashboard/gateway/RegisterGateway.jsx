// RegisterGateway.jsx
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
import { Textarea } from '@/components/ui/textarea';

function RegisterGateway({ onRegister, subariaOptions , creating }) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [newGateway, setNewGateway] = useState({
    gatewayGuid: "",
    gatewayName: "",
    authenticationKeyPublic: "",
    subsetId: ""
  });

  const handleRegisterGateway = async (event) => {
    event.preventDefault();
    
    
    try {
      toast(`Gateway ${newGateway.gatewayName} registered successfully.`);
      setNewGateway({
        gatewayGuid: "",
        gatewayName: "",
        authenticationKeyPublic: "",
        subsetId: ""
      });
      setIsRegisterDialogOpen(false);
      if (onRegister) onRegister(newGateway);
    } catch (error) {
      console.error("Failed to register gateway:", error);
      toast("Failed to register the gateway.");
    }
  };

  return (
    <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Gateway
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register New Gateway</DialogTitle>
          <DialogDescription>
            Enter the gateway details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegisterGateway}>
          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-4">
              <Label htmlFor="gatewayName" className="">
                Gateway Name
              </Label>
              <Input
                id="gatewayName"
                value={newGateway.gatewayName}
                onChange={(e) =>
                  setNewGateway({ ...newGateway, gatewayName: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid w-full items-center gap-4">
              <Label htmlFor="gatewayGuid" className="text-right">
                Gateway GUID
              </Label>
              <Input
                id="gatewayGuid"
                value={newGateway.gatewayGuid}
                onChange={(e) =>
                  setNewGateway({ ...newGateway, gatewayGuid: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>


            <div className="grid w-full gap-3">
              <Label htmlFor="message-2">Authentication Key Public</Label>
              <Textarea placeholder="Type your message here." id="message-2" 
              value={newGateway.authenticationKeyPublic}
                onChange={(e) =>
                  setNewGateway({ ...newGateway, authenticationKeyPublic: e.target.value })
                }
                required

              />
              <p className="text-muted-foreground text-sm">
                Past The public Key Of the Gateway Her.
              </p>
            </div>


            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subsetId" className="text-right">
                Subaria ID
              </Label>
              <Select
                onValueChange={(value) => setNewGateway({ ...newGateway, subsetId: value })}
                value={newGateway.subsetId}
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

            <Button type="submit" disabled={creating}>
              {creating ? "Saving..." : "Save Gateway"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RegisterGateway;