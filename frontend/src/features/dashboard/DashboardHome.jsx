import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Network, Server, Wifi, CheckCircle, XCircle, MapIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchDeviceAll, selectDeviceList } from "./devices/deviceSlice";
import { fetchGatewayAll, selectGatewayList } from "./gateway/gatewaySlice";
import { fetchSubariaAll , selectSubariaList} from "./subaria/subariaSlice"
import StatusBadge from "@/ui/StatusBadge";
import SystemFlowChart from "./SystemFlowChart";

function DashboardHome() {
  const dispatch = useDispatch();
  const deviceList = useSelector(selectDeviceList);
  const gatewayList = useSelector(selectGatewayList);
  const subarisList = useSelector(selectSubariaList);

  useEffect(() => {
    dispatch(fetchDeviceAll());
    dispatch(fetchGatewayAll());
    dispatch(fetchSubariaAll());
  }, [dispatch]);

  // Device statistics
  const totalDevices = deviceList.length;
  const connectedDevices = deviceList.filter(d => d.status === "running" || d.status === "active").length;
  const unprovisionedDevices = deviceList.filter(d => d.status === "unprovisioned").length;

  // Gateway statistics
  const totalGateways = gatewayList.length;
  const onlineGateways = gatewayList.filter(g => g.status === "online").length;
  const offlineGateways = gatewayList.filter(g => g.status === "offline").length;

  const totalSubaris = subarisList.length;

  return (
    <div className="container px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Welcome to the Key Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-6 h-6" /> Devices
            </CardTitle>
            <CardDescription>All registered devices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-bold text-2xl">{totalDevices}</span>{" "}
              <Badge variant="secondary">Total</Badge>
            </div>
            <div>
              <span className="font-bold text-lg">{connectedDevices}</span>{" "}
              <Badge variant="success"><CheckCircle className="inline w-4 h-4 mr-1" />Connected</Badge>
            </div>
            <div>
              <span className="font-bold text-lg">{unprovisionedDevices}</span>{" "}
              <Badge variant="outline">Unprovisioned</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-6 h-6" /> Gateways
            </CardTitle>
            <CardDescription>All system gateways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-bold text-2xl">{totalGateways}</span>{" "}
              <StatusBadge status="Total">Total</StatusBadge>
            </div>
            <div>
              <span className="font-bold text-lg">{onlineGateways}</span>{" "}
              <StatusBadge status="online"><Wifi className="inline w-4 h-4 mr-1" />Online</StatusBadge>
            </div>
            <div>
              <span className="font-bold text-lg">{offlineGateways}</span>{" "}
              <StatusBadge status="offline"><XCircle className="inline w-4 h-4 mr-1" />Offline</StatusBadge>
            </div>
          </CardContent>
        </Card>
        {/* Add more cards for other statistics as needed */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="w-6 h-6" /> Subarias
            </CardTitle>
            <CardDescription>All Subarias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-bold text-2xl">{totalSubaris}</span>{" "}
              <StatusBadge status="Total">Total</StatusBadge>
            </div>
          </CardContent>
        </Card>

      </div>
      <div className="grid grid-cols-1  gap-6 mb-8">
        <h2>Chart Flow</h2>
        <SystemFlowChart />
      </div>
    </div>
  );
}

export default DashboardHome;