import React from 'react'
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


import { Label } from "@/components/ui/label";
import { MapIcon } from "lucide-react";



function SubariaCard({selectedSubaria , setSelectedSubaria , loadingSubaria , subariaList}) {
  return (
    <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapIcon className="mr-2 inline-block h-5 w-5" />{" "}
              <span className="text-2xl font-bold">
                Subaria
              </span>
            </CardTitle>
            <CardDescription>Select Subaria redistribution now.</CardDescription>
          </CardHeader>

            <CardContent className="space-y-4">
              <div className="w-full space-y-2">
                <Label htmlFor="manualTarget">Target Subaria</Label>
                <Select
                  value={selectedSubaria}
                  onValueChange={setSelectedSubaria}
                  disabled={loadingSubaria}
                >
                  <SelectTrigger id="manualTarget" className="w-full">
                    <SelectValue placeholder="Select target..." />
                  </SelectTrigger>
                  <SelectContent>
                    
                    {loadingSubaria ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      subariaList.map((subaria) => (
                        <SelectItem key={subaria.id} value={subaria.id}>
                          {subaria.subsetName} -- ({subaria.subsetIdentifier})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
        </Card>
  )
}

export default SubariaCard