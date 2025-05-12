import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react"; // Added import for the History icon

// Mock function to simulate API delay
const fetchMockHistory = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          taskId: "TASK-001",
          status: "Success",
          target: "All",
          timestamp: new Date().toISOString(),
        },
        {
          taskId: "TASK-002",
          status: "Pending",
          target: "D12345",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
        {
          taskId: "TASK-003",
          status: "Failed",
          target: "D67890",
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // Two days ago
        },
      ]);
    }, 1500); // Simulate 1.5s network delay
  });
};

export default function RedistributionHistory() {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchMockHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  // Return badge color based on status
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "default";
      case "running":
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 inline-block h-5 w-5" />
          <span className="font-bold text-2xl"> Redistribution History</span>
        </CardTitle>
        <CardDescription>View past and scheduled tasks.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loadingHistory ? (
          <p className="p-6 text-center">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            No history found.
          </p>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((task) => (
                <TableRow key={task.taskId}>
                  <TableCell className="font-mono text-xs">
                    {task.taskId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.target === "All" ? "All Devices" : task.target}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(task.timestamp).toLocaleString()}
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
