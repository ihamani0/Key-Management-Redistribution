import { Handle, Position } from '@xyflow/react';

const GatewayNode = ({ data }) => {
  const isOnline = data.status === 'online';
  const statusColor = isOnline ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
  const statusDot = isOnline ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`relative w-20 h-16 border-2 ${statusColor} rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow`}>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{ 
          background: '#6366f1', 
          width: 8, 
          height: 8, 
          border: '2px solid white' 
        }}
      />
      
      {/* Status indicator dot */}
      <div className={`absolute top-1 right-1 w-2 h-2 ${statusDot} rounded-full`}></div>
      
      {/* Gateway icon */}
      <div className="text-blue-600 mb-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-800 truncate max-w-16" title={data.label}>
          {data.label}
        </p>
        <p className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{ 
          background: '#6366f1', 
          width: 8, 
          height: 8, 
          border: '2px solid white' 
        }}
      />
    </div>
  );
};

export default GatewayNode;