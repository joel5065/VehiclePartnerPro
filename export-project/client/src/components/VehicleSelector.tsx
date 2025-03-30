import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getVehicleMakes, getVehicleModels, getVehicleEngines } from "../lib/api";
import { getYearRange } from "../lib/utils";

interface VehicleSelectorProps {
  onSelectVehicle?: (vehicle: {
    year: string;
    makeId: string;
    modelId: string;
    engineId: string;
  }) => void;
  variant?: "compact" | "full";
  className?: string;
}

const VehicleSelector = ({ 
  onSelectVehicle,
  variant = "full",
  className = ""
}: VehicleSelectorProps) => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("");
  
  const years = getYearRange(1990);
  
  const { data: makes = [] } = useQuery({
    queryKey: ["/api/vehicle-makes"],
  });
  
  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ["/api/vehicle-models", selectedMake],
    enabled: !!selectedMake,
  });
  
  const { data: engines = [], isLoading: isLoadingEngines } = useQuery({
    queryKey: ["/api/vehicle-engines", selectedModel],
    enabled: !!selectedModel,
  });
  
  const filteredModels = selectedMake
    ? models.filter((model: any) => model.makeId === parseInt(selectedMake))
    : [];
    
  const filteredEngines = selectedModel
    ? engines.filter((engine: any) => engine.modelId === parseInt(selectedModel))
    : [];
  
  // Reset dependent fields when a selection changes
  useEffect(() => {
    setSelectedModel("");
    setSelectedEngine("");
  }, [selectedMake]);
  
  useEffect(() => {
    setSelectedEngine("");
  }, [selectedModel]);
  
  const handleFindParts = () => {
    if (onSelectVehicle && selectedYear && selectedMake && selectedModel) {
      onSelectVehicle({
        year: selectedYear,
        makeId: selectedMake,
        modelId: selectedModel,
        engineId: selectedEngine
      });
    }
  };
  
  return (
    <div className={`bg-gray-100 rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Find Parts For Your Vehicle</h2>
      <div className={`grid grid-cols-1 ${variant === "full" ? "md:grid-cols-5" : "md:grid-cols-4"} gap-4`}>
        <div>
          <Label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</Label>
          <Select value={selectedMake} onValueChange={setSelectedMake} disabled={!selectedYear}>
            <SelectTrigger id="make">
              <SelectValue placeholder="Select Make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make: any) => (
                <SelectItem key={make.id} value={make.id.toString()}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</Label>
          <Select 
            value={selectedModel} 
            onValueChange={setSelectedModel} 
            disabled={!selectedMake || isLoadingModels}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.map((model: any) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-1">Engine</Label>
          <Select 
            value={selectedEngine} 
            onValueChange={setSelectedEngine} 
            disabled={!selectedModel || isLoadingEngines}
          >
            <SelectTrigger id="engine">
              <SelectValue placeholder="Select Engine" />
            </SelectTrigger>
            <SelectContent>
              {filteredEngines.map((engine: any) => (
                <SelectItem key={engine.id} value={engine.id.toString()}>
                  {engine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {variant === "full" && (
          <div className="flex items-end">
            <Button 
              type="button" 
              className="w-full bg-primary hover:bg-red-600"
              onClick={handleFindParts}
              disabled={!selectedYear || !selectedMake || !selectedModel}
            >
              Find Parts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleSelector;
