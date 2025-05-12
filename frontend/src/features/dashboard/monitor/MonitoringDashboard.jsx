// src/pages/MonitoringDashboard.jsx
import React, { useState, useEffect } from 'react';
// You would import actual shadcn/ui components here if set up
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { BellIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react'; // Example icons

// --- Helper Components (Mimicking Shadcn/ui structure) ---

// Mimic Card component
const Card = ({ children, className = '' }) => (
  <div className={`bg-card text-card-foreground border rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// Mimic Badge component
const Badge = ({ children, variant = 'default', className = '' }) => {
  let badgeClasses = 'px-2.5 py-0.5 text-xs font-semibold rounded-full ';
  if (variant === 'destructive') {
    badgeClasses += 'bg-destructive text-destructive-foreground';
  } else if (variant === 'outline') {
    badgeClasses += 'border text-foreground';
  } else if (variant === 'secondary') {
    badgeClasses += 'bg-secondary text-secondary-foreground';
  } else if (variant === 'success') { // Custom variant
    badgeClasses += 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
  } else { // default
    badgeClasses += 'bg-primary text-primary-foreground';
  }
  return <span className={`${badgeClasses} ${className}`}>{children}</span>;
};

// --- Placeholder Data ---
const initialSystemHealth = {
  status: 'Green', // Green, Yellow, Red
  message: 'All systems operational.'
};

const initialGatewaySummary = {
  total: 5,
  online: 4,
  offline: 1,
  offlineGateways: [{ id: 'gw-003', name: 'Warehouse Gateway 3' }]
};

const initialDeviceSummary = {
  total: 56,
  active: 50,
  inactive: 2,
  unprovisioned: 3,
  keyIssues: 1,
};

const initialRecentKeyOps = [
  { id: 1, description: "Key refresh for 'Living Room' completed", status: 'success', time: '10:30 AM' },
  { id: 2, description: "Device 'Sensor_Kitchen_1' provisioned", status: 'success', time: '09:15 AM' },
  { id: 3, description: "Key update failed for 'Light_Office_Main'", status: 'failure', time: 'Yesterday' },
];

const initialAlerts = [
  { id: 1, message: "Gateway 'Warehouse Gateway 3' has been offline for >1 hour!", severity: 'high' },
  { id: 2, message: "Low battery reported for 'Sensor_Outdoor_Temp'", severity: 'medium' },
];

// --- Main Dashboard Component ---
const MonitoringDashboard = () => {
  // In a real app, this data would come from API calls
  const [systemHealth, setSystemHealth] = useState(initialSystemHealth);
  const [gatewaySummary, setGatewaySummary] = useState(initialGatewaySummary);
  const [deviceSummary, setDeviceSummary] = useState(initialDeviceSummary);
  const [recentKeyOps, setRecentKeyOps] = useState(initialRecentKeyOps);
  const [alerts, setAlerts] = useState(initialAlerts);

  // useEffect(() => {
  //   // TODO: Fetch data from APIs
  //   // fetchSystemHealth().then(data => setSystemHealth(data));
  //   // fetchGatewaySummary().then(data => setGatewaySummary(data));
  //   // ...and so on
  // }, []);

  const getHealthColor = (status) => {
    if (status === 'Green') return 'bg-green-500';
    if (status === 'Yellow') return 'bg-yellow-500';
    if (status === 'Red') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Monitoring Dashboard</h1>
        {/* You could add a BellIcon here for notifications */}
      </header>

      {/* Overall System Health */}
      <Card>
        <CardHeader>
          <CardTitle>Overall System Health</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full ${getHealthColor(systemHealth.status)}`}></div>
          <div>
            <p className="text-lg font-semibold text-foreground">{systemHealth.status}</p>
            <p className="text-sm text-muted-foreground">{systemHealth.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gateway Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Gateway Status</CardTitle>
            <CardDescription>Overview of gateway connectivity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Total Gateways: <span className="font-semibold">{gatewaySummary.total}</span></p>
            <p>Online: <Badge variant="success">{gatewaySummary.online}</Badge></p>
            <p>Offline: <Badge variant="destructive">{gatewaySummary.offline}</Badge></p>
            {gatewaySummary.offline > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-foreground">Offline Gateways:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {gatewaySummary.offlineGateways.map(gw => <li key={gw.id}>{gw.name}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
            <CardDescription>Overview of end-device states.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Total Devices: <span className="font-semibold">{deviceSummary.total}</span></p>
            <p>Active: <Badge variant="success">{deviceSummary.active}</Badge></p>
            <p>Inactive: <Badge variant="secondary">{deviceSummary.inactive}</Badge></p>
            <p>Unprovisioned: <Badge variant="outline">{deviceSummary.unprovisioned}</Badge></p>
            <p>Key Issues: <Badge variant="destructive">{deviceSummary.keyIssues}</Badge></p>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <Card className="md:col-span-2 lg:col-span-1"> {/* Spans more on smaller screens if needed */}
          <CardHeader>
            <CardTitle className="flex items-center">
              {/* <AlertTriangleIcon className="w-5 h-5 mr-2 text-destructive" /> */}
              <span className="mr-2">⚠️</span> {/* Simple emoji icon */}
              Active Alerts
            </CardTitle>
            <CardDescription>Critical issues needing attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.map(alert => (
                  <li key={alert.id} className={`p-3 rounded-md text-sm ${
                    alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200'
                                             : 'bg-yellow-100 dark:bg-yellow-700 border border-yellow-200 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200'
                  }`}>
                    {alert.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No active alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Key Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Key Operations</CardTitle>
          <CardDescription>Latest key management activities.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* This would ideally be a shadcn/ui Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Description</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentKeyOps.length > 0 ? recentKeyOps.map(op => (
                  <tr key={op.id} className="bg-card border-b hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{op.description}</td>
                    <td className="px-6 py-4">
                      <Badge variant={op.status === 'success' ? 'success' : 'destructive'}>
                        {op.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{op.time}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center">No recent operations.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default MonitoringDashboard;