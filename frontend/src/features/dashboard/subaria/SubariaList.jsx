
import React, { useState } from 'react'
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


function SubariaList({  subariaList = [] , loading , onRemove}) {

const [subariaToRemove, setSubariaToRemove] = useState(null);


const handleRemoveSubaria = () => {
    if (onRemove && subariaToRemove) {
      
      onRemove(subariaToRemove);
      
      toast(`${subariaToRemove.subsetName} has been removed.`);
    }
    setSubariaToRemove(null);
  };

  return (
    <Card className="shadow-sm px-4 py-6">
      <CardContent className="p-0">
        {loading ? (
          <p className="p-6 text-center">Loading...</p>
        ) : subariaList.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            No Subaria found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subset ID</TableHead>
                <TableHead>Subset Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subariaList.map((subaria) => (
                <TableRow key={subaria.subsetIdentifier}>
                  <TableCell><span  className='font-sans'>{subaria.subsetIdentifier}</span></TableCell>
                  <TableCell className="font-medium">{subaria.subsetName}</TableCell>
                  <TableCell>{subaria.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setSubariaToRemove(subaria)}
                          aria-label="Remove Subaria"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the Subaria{" "}
                            <span className="font-semibold">
                              {subaria.subsetName} ({subaria.subsetIdentifier})
                            </span>{" "}
                            and its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSubariaToRemove(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRemoveSubaria}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            Yes, Remove Subaria
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
  )
}

export default SubariaList