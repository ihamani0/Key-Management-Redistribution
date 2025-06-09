
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";


import { Eye, History } from "lucide-react"; // Added import for the History icon
import StatusBadge from "@/ui/StatusBadge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/ui/SearchBar";





export default function RedistributionHistory({taskList , taskListLoading , taskListError , searchTerm , setSearchTerm}) {


  const [detailsDialogOpen , setDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleViewDetails = (task) => {
    // Placeholder for view details functionality
    // You can implement this to show more details about the task
    setSelectedTask(task);
    setDetailsDialogOpen(true);
    console.log("View details clicked");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 inline-block h-5 w-5" />
          <span className="font-bold text-2xl"> Tasks History</span>
        </CardTitle>
        <CardDescription>View past tasks.</CardDescription>
      </CardHeader>


      <CardContent className="p-0">


        <div className="w-full px-6 py-4">
          <SearchBar 
          placeholder="Search Task by Task Type ..."
          value={searchTerm}
          onChange={setSearchTerm}
          ariaLabel="Search Subaria"
          className='sm:w-72'
          />
        </div>



        {/* Loading State */}
        {taskListLoading ? (
          <p className="p-6 text-center">Loading history...</p>
        ) : taskListError ? (
          // Error State
          <p className="p-6 text-center text-red-500">
            {taskListError}
          </p>
        ) : !taskList || taskList.length === 0 ? (
          // Empty State
          <p className="p-6 text-center text-muted-foreground">
            No history found.
          </p>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Task Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Device</TableHead>
                <TableHead>createdAt</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader> 
            <TableBody>
              {taskList.map((task) => (
                <TableRow key={task.taskId}>

                  <TableCell className='font-mono text-xs'>{task.taskId}</TableCell>

                  <TableCell className="font-mono text-xs">
                    <StatusBadge status={task.taskType} >
                      {task.taskType || "Unknown"}
                    </StatusBadge>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={task.status}>
                      {task.status}
                    </StatusBadge>
                  </TableCell>


                  <TableCell>
                    {task?.device ? task?.device?.deviceGuid || "" : <span className="text-xs">All Device</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(task.created_at).toLocaleString()}
                  </TableCell>


                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(task)}
                      aria-label="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
                  <DialogTitle>Task Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about the selected Task.
                  </DialogDescription>
                </DialogHeader>
                {selectedTask && (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm font-bold text-gray-700">
                        <StatusBadge status={selectedTask.taskType}>
                          {selectedTask.taskType || "Unknown"}
                        </StatusBadge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd>
                        <StatusBadge status={selectedTask.status}>
                          {selectedTask.status}
                        </StatusBadge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Target Device</dt>
                      <dd className="text-sm font-bold text-gray-700">
                        {selectedTask?.device
                          ? selectedTask.device.deviceGuid || ""
                          : "All Device"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Target Subaria</dt>
                      <dd className="text-sm font-bold text-gray-700">
                        {selectedTask?.subset
                          ? selectedTask.subset.subsetIdentifier || ""
                          :"N|A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Target Gateway</dt>
                      <dd className="text-sm font-bold text-gray-700">
                        {selectedTask?.gateway
                          ? selectedTask.gateway.gatewayGuid || ""
                          : "N|A"}
                      </dd>
                    </div> 

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Result Message</dt>
                      <dd className="text-sm font-bold text-gray-700">
                        {selectedTask.resultMessage ? selectedTask.resultMessage  :"N/A"}
                      </dd>
                    </div> 


                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="text-sm text-muted-foreground">
                        {selectedTask.created_at
                          ? new Date(selectedTask.created_at).toLocaleString()
                          : "N/A"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                      <dd className="text-sm text-muted-foreground">
                        {selectedTask.updated_at
                          ? new Date(selectedTask.updated_at).toLocaleString()
                          : "N/A"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Started At</dt>
                      <dd className="text-sm text-muted-foreground">
                        {selectedTask.startedAt
                          ? new Date(selectedTask.startedAt).toLocaleString()
                          : "N/A"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Completed At</dt>
                      <dd className="text-sm text-muted-foreground">
                        {selectedTask.completedAt
                          ? new Date(selectedTask.completedAt).toLocaleString()
                          : "N/A"}
                      </dd>
                    </div>

                    {/* Add more fields here if needed */}
                  </dl>
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
