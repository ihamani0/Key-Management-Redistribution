/* eslint-disable no-unused-vars */
import React, { useState } from "react";

// Card UI Components
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Icons
import { CalendarIcon, Clock, PlusCircle } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function ScheduleCard({ devices = [], loadingDevices = true }) {
  const [selectedScheduleTarget, setSelectedScheduleTarget] = useState("All");
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [recurrence, setRecurrence] = useState("None");

  // Handle form submission
  const handleScheduleRedistribution = async (event) => {
    event.preventDefault();

    if (!scheduleDate) {
      toast.error("Please select a date.");
      return;
    }

    try {
      // Combine date and time into ISO string
      const [hours, minutes] = scheduleTime.split(":").map(Number);
      const scheduleDateTime = new Date(scheduleDate);
      scheduleDateTime.setHours(hours, minutes, 0, 0);
      const isoDateTime = scheduleDateTime.toISOString();

      // Uncomment this when service is ready
      // await scheduleRedistribution(selectedScheduleTarget, isoDateTime, recurrence);

      // Reset form fields
      setSelectedScheduleTarget("All");
      setScheduleDate(null);
      setScheduleTime("12:00");
      setRecurrence("None");

      toast.success("Task scheduled successfully!");
    } catch (error) {
      console.error("Failed to schedule redistribution:", error);
      toast.error("Failed to schedule task.");
    }
  };

  return (
    <Card className="w-full shadow-md rounded-lg">
      {/* Header */}
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="mr-2 inline-block h-5 w-5" />{" "}
          <span className="font-bold text-2xl">Schedule Redistribution</span>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Set up a future key redistribution task with optional recurrence.
        </CardDescription>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6">
        <form onSubmit={handleScheduleRedistribution} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Devices */}
            <div className="space-y-2">
              <Label htmlFor="scheduleTarget">Target</Label>
              <Select
                value={selectedScheduleTarget}
                onValueChange={setSelectedScheduleTarget}
              >
                <SelectTrigger id="scheduleTarget" className="w-full">
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

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? (
                      format(scheduleDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="scheduleTime">Time</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Recurrence Selector */}
            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select recurrence..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loadingDevices}
              className="w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
