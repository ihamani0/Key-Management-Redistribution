import { Handle, Position } from '@xyflow/react';

const DeviceNode = ({ data }) => {
  const isOnline = data.status === 'online';
  const statusColor = isOnline ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
  const statusDot = isOnline ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`relative w-16 h-16 border-2 ${statusColor} rounded-full flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow`}>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{ 
          background: '#10b981', 
          width: 6, 
          height: 6, 
          border: '2px solid white' 
        }}
      />
      
      {/* Status indicator dot */}
      <div className={`absolute top-0 right-1 w-2 h-2 ${statusDot} rounded-full border border-white`}></div>
      
      {/* Device icon */}
      <div className="text-indigo-600 mb-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z"/>
          <circle cx="12" cy="18" r="1"/>
        </svg>
      </div>
      
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-800 truncate max-w-12" title={data.label}>
          {data.label}
        </p>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{ 
          background: '#10b981', 
          width: 6, 
          height: 6, 
          border: '2px solid white' 
        }}
      />
    </div>
  );
};

export default DeviceNode;