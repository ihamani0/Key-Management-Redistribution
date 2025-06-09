import { Badge } from "@/components/ui/badge";

const statusColors = {
  unprovisioned: "bg-gray-200 text-gray-800",
  provisioned: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  running: "bg-emerald-100 text-emerald-800",
  revoked: "bg-red-100 text-red-800",
  
  online: "bg-green-100 text-green-800",
  offline: "bg-red-100 text-red-800",

  provision: "bg-yellow-100 text-yellow-800",
  revocation: "bg-red-100 text-red-800",
  refresh: "bg-purple-100 text-purple-800",
  scheduled: "bg-gray-100 text-gray-800",

  //status of tasks 
  completed : "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  const color = statusColors[normalized] || "bg-gray-100 text-gray-800";
  return (
    <Badge className={color} variant="outline">
      {status || "Unknown"}
    </Badge>
  );
}

export default StatusBadge;