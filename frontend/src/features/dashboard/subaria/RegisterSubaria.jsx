import React, { useState } from 'react'
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

function RegisterSubaria({ onRegister, creating }) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [newSubaria, setNewSubaria] = useState({
    subsetName: "",
    subsetIdentifier: "",
    description: "",
  });

  const handleRegisterSubaria = async (event) => {
    event.preventDefault();
    try {
      await onRegister(newSubaria);
      toast(`Subaria ${newSubaria.subsetName} registered successfully.`);
      setNewSubaria({
        subsetName: "",
        subsetIdentifier: "",
        description: "",
      });
      setIsRegisterDialogOpen(false);
    } catch (error) {
      toast("Error" , {description : `Failed to register the Subaria. with ${error.message}`});
    }
  };

  return (
    <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Register New Subaria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Subaria :</DialogTitle>
          <DialogDescription>
            Enter the details for the Subaria. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegisterSubaria}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subsetName" className="text-right">
                Subset Name  
              </Label>
              <Input
                id="subsetName"
                value={newSubaria.subsetName}
                onChange={(e) =>
                  setNewSubaria({ ...newSubaria, subsetName: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subsetIdentifier" className="text-right">
                Subset Identifier 
              </Label>
              <Input
                id="subsetIdentifier"
                value={newSubaria.subsetIdentifier}
                onChange={(e) =>
                  setNewSubaria({ ...newSubaria, subsetIdentifier: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newSubaria.description}
                onChange={(e) =>
                  setNewSubaria({ ...newSubaria, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={creating}>
              {creating ? "Saving..." : "Save Subaria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterSubaria