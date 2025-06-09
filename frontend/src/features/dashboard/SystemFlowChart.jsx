import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { selectDeviceList } from "./devices/deviceSlice";
import { selectGatewayList } from "./gateway/gatewaySlice";
import { selectSubariaList } from "./subaria/subariaSlice";
import DeviceNode from "./flowChart/DeviceNode";
import GatewayNode from "./flowChart/GatewayNode";
import SubariaGroupNode from "./flowChart/SubariaGroupNode"; 

// --- Layout Constants for easy adjustments ---
const SUBAREA_PADDING_X = 50;
const SUBAREA_PADDING_Y = 40;
const SUBAREA_HEADER_HEIGHT = 40;
const HORIZONTAL_SPACING = 150; // Space between nodes horizontally
const VERTICAL_SPACING = 120; // Space between rows of nodes
const SUBAREA_MARGIN = 100; // Space between subarea groups

function SystemFlowChart() {
  const subarias = useSelector(selectSubariaList);
  const devices = useSelector(selectDeviceList);
  const gateways = useSelector(selectGatewayList);

  // --- State for nodes and edges to enable interactivity (like dragging) ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Custom node types (no changes here)
  const nodeTypes = useMemo(
    () => ({
      device: DeviceNode,
      gateway: GatewayNode,
      group: SubariaGroupNode,
    }),
    []
  );

  // --- Handlers for node changes (e.g., drag) ---
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // --- useEffect to build the layout when data from Redux changes ---
  useEffect(() => {
    const initialNodes = [];
    const initialEdges = [];
    let currentSubareaX = 0; // Tracks horizontal position for each subarea group

    subarias.forEach((s) => {
      // 1. Filter nodes for the current subarea
      const subariaGateways = gateways.filter((g) => g.subset?.id === s.id);
      const subariaDevices = devices.filter((d) => d.subset?.id === s.id);

      // 2. Calculate the required width and height for the subarea group
      const gatewayRowWidth = subariaGateways.length * HORIZONTAL_SPACING;
      const deviceRowWidth = subariaDevices.length * HORIZONTAL_SPACING;
      const subareaWidth = Math.max(gatewayRowWidth, deviceRowWidth, 250) + SUBAREA_PADDING_X * 2;

      let subareaHeight = SUBAREA_HEADER_HEIGHT + SUBAREA_PADDING_Y * 2;
      if (subariaGateways.length > 0) subareaHeight += VERTICAL_SPACING;
      if (subariaDevices.length > 0) subareaHeight += VERTICAL_SPACING;

      // 3. Create the Subarea Group Node
      initialNodes.push({
        id: `subaria-${s.id}`,
        type: "group",
        data: { label: `Subarea: ${s.subsetName}` },
        position: { x: currentSubareaX, y: 50 },
        style: {
          width: subareaWidth,
          height: subareaHeight,
          backgroundColor: "rgba(238, 242, 255, 0.8)",
          border: "2px solid #6366f1",
          borderRadius: 16,
          boxShadow: "0 4px 12px 0 rgba(199, 210, 254, 0.6)",
        },
      });

      // 4. Position Gateway Nodes in a neat row
      const gatewayY = SUBAREA_HEADER_HEIGHT + SUBAREA_PADDING_Y;
      const gatewayStartX = (subareaWidth - gatewayRowWidth) / 2 + HORIZONTAL_SPACING / 2;
      subariaGateways.forEach((g, idx) => {
        initialNodes.push({
          id: `gateway-${g.gatewayGuid}`,
          type: "gateway",
          parentId: `subaria-${s.id}`,
          extent: "parent", // Constrains dragging to within the parent subarea
          data: { label: g.gatewayGuid, status: g.status },
          position: {
            x: gatewayStartX + idx * HORIZONTAL_SPACING,
            y: gatewayY,
          },
          draggable: true,
        });
      });

      // 5. Position Device Nodes in a row below gateways
      const deviceY = gatewayY + (subariaGateways.length > 0 ? VERTICAL_SPACING : 0);
      const deviceStartX = (subareaWidth - deviceRowWidth) / 2 + HORIZONTAL_SPACING / 2;
      subariaDevices.forEach((d, idx) => {
        initialNodes.push({
          id: `device-${d.deviceGuid}`,
          type: "device",
          parentId: `subaria-${s.id}`,
          extent: "parent", // Constrains dragging to within the parent subarea
          data: { label: d.localIdentifierInSubset, status: d.status },
          position: {
            x: deviceStartX + idx * HORIZONTAL_SPACING,
            y: deviceY,
          },
          draggable: true,
        });
      });

      // 6. Create Edges
      subariaGateways.forEach((gateway) => {
        subariaDevices.forEach((device) => {
          const isConnectionActive = device.status === 'online' && gateway.status === 'online';
          initialEdges.push({
            id: `edge-${gateway.gatewayGuid}-${device.deviceGuid}`,
            source: `gateway-${gateway.gatewayGuid}`,
            target: `device-${device.deviceGuid}`,
            type: 'smoothstep', // A nicer-looking edge type
            animated: isConnectionActive,
            style: { stroke: isConnectionActive ? '#16a34a' : '#9ca3af', strokeWidth: 2.5 },
          });
        });
      });

      // 7. Update the X position for the next subarea group
      currentSubareaX += subareaWidth + SUBAREA_MARGIN;
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [subarias, devices, gateways]); // Recalculate layout if data changes

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        background: "#f8fafc",
        borderRadius: 8,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }} // Add some padding around the final view
      >
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Controls />
        <Background gap={24} />
      </ReactFlow>
    </div>
  );
}

export default SystemFlowChart;