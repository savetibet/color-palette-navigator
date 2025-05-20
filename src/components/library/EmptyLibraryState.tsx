
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type EmptyLibraryStateProps = {
  onAddClick: () => void;
  hasFilters: boolean;
};

const EmptyLibraryState = ({ onAddClick, hasFilters }: EmptyLibraryStateProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-gray-500 dark:text-gray-400">
        {hasFilters ? "No colors match your filters" : "No colors in this library yet"}
      </p>
      <Button className="mt-4" onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-1" />
        Add Color
      </Button>
    </div>
  );
};

export default EmptyLibraryState;
