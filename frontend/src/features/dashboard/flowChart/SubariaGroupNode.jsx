import React from 'react';

// This component receives props from React Flow, including:
// - data: The `data` object you define for the node (e.g., { label: 'My Title' })
// - children: The actual child nodes (gateways, devices) that React Flow will render inside this group.
const SubariaGroupNode = ({ data, children }) => {
  return (
    // The main container for the group. Styling here matches the style object from SystemFlowChart.jsx.
    // We add flexbox to easily position the header and content.
    <div style={{
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 1. The Custom Title Header */}
      <div 
        style={{
          padding: '8px 16px',
          backgroundColor: '#c0c4dd',
          color: 'black',
          fontWeight: 'bold',
          fontSize: '16px',
          borderTopLeftRadius: '12px', // Match the parent's border-radius
          borderTopRightRadius: '12px',
          textAlign: 'center',
          flexShrink: 0, // Prevent the header from shrinking
        }}
      >
        {data.label}
      </div>

      {/* 2. The Container for Child Nodes */}
      {/* `children` is a special prop provided by React Flow which contains the child nodes to be rendered. */}
      {/* We add `position: relative` and `flex-grow: 1` to make it fill the remaining space. */}
      <div style={{ position: 'relative', flexGrow: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default SubariaGroupNode;