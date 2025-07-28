import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner = ({ 
  className, 
  size = "md", 
  text = "Loading..." 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 flex flex-col items-center justify-center",
      className
    )}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">UR</span>
        </div>
        <Loader2 className={cn("animate-spin text-purple-600", sizeClasses[size])} />
      </div>
      {text && (
        <p className="mt-4 text-lg text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};