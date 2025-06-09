/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, setFilters } from './auditLogSlice';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Spinner  from "@/ui/Spinner";
import { format } from "date-fns";
import { Eye } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";




const TABLE_OPTIONS = [
  {id:1 , value: undefined, label: "All Tables" },
  {id:2 , value: "devices", label: "Devices" },
  {id:3 ,value: "gateways", label: "Gateways" },
  {id:4 , value: "subarias", label: "Subarias" },
  {id:5 , value: "device_keys", label: "Device Keys" },
  {id:6 , value: "key_redistribution_tasks", label: "Key Redistribution Tasks" },
];

const ACTION_OPTIONS = [
  {id:1 , value: undefined, label: "All Actions" },
  {id:2 , value: "INSERT", label: "Insert" },
  {id:3 ,value: "UPDATE", label: "Update" },
  {id:4 , value: "DELETE", label: "Delete" },
];



function Monitoring() {

    const dispatch = useDispatch();
    const { logs, total, loading, error, filters } = useSelector((state) => state.auditLogs);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    

      // Fetch logs on mount and when filters change
    useEffect(() => {
        dispatch(fetchAuditLogs(filters));
    }, [dispatch, filters]);




      // Handlers
    
    const handleViewDetails = (log)=>{
        setDetailsDialogOpen(true)
        setSelectedLog(log)
    }
      const handleFilterChange = (field, value) => {
        dispatch(setFilters({ [field]: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        dispatch(setFilters({ page: newPage }));
    };

    console.log(logs)

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card>

                <CardHeader>
                    <CardTitle>Audit Log Monitoring</CardTitle>
                    <CardDescription>
                        Track all system changes: devices, gateways, subarias, tasks, and key operations.
                    </CardDescription>
                </CardHeader>


                <CardContent>

                    {/* Filters */}
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                    
                    <Input
                        placeholder="Search by user, entity, or details..."
                        value={filters.query}
                        onChange={e => handleFilterChange("query", e.target.value)}
                        className="w-64"
                    />

                    <Select value={filters.table} onValueChange={v => handleFilterChange("table", v)}>
                        
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Table" />
                        </SelectTrigger>

                        <SelectContent>
                            {TABLE_OPTIONS.map(opt  => (
                            <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>


                    <Select value={filters.action} onValueChange={v => handleFilterChange("action", v)}>
                        
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>

                        <SelectContent>
                            {ACTION_OPTIONS.map(opt => (
                            <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={e => handleFilterChange("dateFrom", e.target.value)}
                        className="w-40"
                        placeholder="From"
                    />
                    <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={e => handleFilterChange("dateTo", e.target.value)}
                        className="w-40"
                        placeholder="To"
                    />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>

                            <TableHeader>
                                <TableRow>
                                <TableHead>Table</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>

                            {loading ? (
                            <TableRow>
                                <TableCell colSpan={5}><Spinner /></TableCell>
                            </TableRow>
                            ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-red-500">{error}</TableCell>
                            </TableRow>
                            ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-muted-foreground text-center">No audit logs found.</TableCell>
                            </TableRow>
                            ) : (
                                logs.map(log => (

                                    <TableRow key={log.auditId}>
                                        <TableCell>{log.tableName}</TableCell>
                                        <TableCell>{log.operation}</TableCell>
                                        <TableCell>{log.changedByUser?.name || log.changed_by}</TableCell>
                                        <TableCell>{format(new Date(log.changedAt), "yyyy-MM-dd HH:mm:ss")}</TableCell>
                                        <TableCell>

                                            <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleViewDetails(log)}
                                            aria-label="View Details"
                                            >
                                            <Eye className="h-4 w-4" />
                                            </Button>
                                            
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            </TableBody>

                        </Table>
                    </div>
                </CardContent>

                
                <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Gateway Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the selected Device.
                        </DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                            <DialogContent>
                                <div className="space-y-2  max-h-[70vh] overflow-y-auto">
                                    <h1>Details:</h1> 
                                    <div className='px-2 py-2'>
                                        <h1>Before:</h1> 
                                        <pre className="whitespace-pre-wrap text-xs max-w-xs overflow-x-auto">
                                                {JSON.stringify({ before: selectedLog.oldData}, null,2)}
                                        </pre>
                                    </div>

                                    <div className='px-2 py-2'>
                                        <h1>After:</h1> 
                                        <pre className="whitespace-pre-wrap text-xs max-w-xs overflow-x-auto">
                                            {JSON.stringify({after: selectedLog.newData }, null,2)}
                                        </pre>
                                    </div>
                                    
                                    

                                    {/* Add more fields as needed */}
                                </div>
                        </DialogContent>
                        )}
                        <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Card>
        </div>
    )
}

export default Monitoring