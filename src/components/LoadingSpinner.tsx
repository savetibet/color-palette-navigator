
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

const LoadingSpinner = ({ size = "default", className }: LoadingSpinnerProps) => {
  const sizeClass = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("animate-spin text-gray-400 dark:text-gray-600", className)}>
      <Loader className={sizeClass[size]} />
    </div>
  );
};

export default LoadingSpinner;
