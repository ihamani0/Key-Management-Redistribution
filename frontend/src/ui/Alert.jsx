import { BadgeInfo, CircleCheck, Info, TriangleAlert, XCircleIcon } from "lucide-react";
import React from "react";

function Alert({ variant = "info", title, children, classStyle }) {
  const variants = {
    info: {
      text: "text-blue-400",
      bg: "bg-gray-800",
      icon: <Info size={20} />,
    },
    danger: {
      text: "text-red-400",
      bg: "bg-gray-800",
      icon: <XCircleIcon size={20} />,
    },
    success: {
      text: "text-green-400",
      bg: "bg-gray-800",
      icon: <CircleCheck size={20} />,
    },
    warning: {
      text: "text-yellow-300",
      bg: "bg-gray-800",
      icon: <TriangleAlert size={20} />,
    },
    dark: {
      text: "text-gray-300",
      bg: "bg-gray-800",
      icon: <BadgeInfo size={20} />,
    },
  };

  return (
    <div
      className={`flex items-center p-4 text-sm rounded-lg ${variants[variant].bg} ${variants[variant].text} ${classStyle}`}
      role="alert"
    >
      <div className="mx-2">{variants[variant].icon}</div>

      <span className="sr-only">{variant}</span>
      <div>
        {title && <span className="font-medium mr-2">{title}</span>}
        {children}
      </div>
    </div>
  );
}

export default Alert;
