import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getVehicleMakes, getVehicleModels, getVehicleEngines, VehicleMake, VehicleModel, VehicleEngine } from "../lib/api";
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
  
  const { data: makes = [] } = useQuery<VehicleMake[]>({
    queryKey: ["/api/vehicle-makes"],
  });
  
  const { data: models = [], isLoading: isLoadingModels } = useQuery<VehicleModel[]>({
    queryKey: ["/api/vehicle-models", selectedMake],
    enabled: !!selectedMake,
  });
  
  const { data: engines = [], isLoading: isLoadingEngines } = useQuery<VehicleEngine[]>({
    queryKey: ["/api/vehicle-engines", selectedModel],
    enabled: !!selectedModel,
  });
  
  const filteredModels = selectedMake
    ? models.filter((model: VehicleModel) => model.makeId === parseInt(selectedMake))
    : [];
    
  const filteredEngines = selectedModel
    ? engines.filter((engine: VehicleEngine) => engine.modelId === parseInt(selectedModel))
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
      <h2 className="text-xl font-semibold mb-4">Trouver des pièces pour votre véhicule</h2>
      <div className={`grid grid-cols-1 ${variant === "full" ? "md:grid-cols-5" : "md:grid-cols-4"} gap-4`}>
        <div>
          <Label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Année</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Sélectionner l'année" />
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
          <Label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Marque</Label>
          <Select value={selectedMake} onValueChange={setSelectedMake} disabled={!selectedYear}>
            <SelectTrigger id="make">
              <SelectValue placeholder="Sélectionner la marque" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make: VehicleMake) => (
                <SelectItem key={make.id} value={make.id.toString()}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Modèle</Label>
          <Select 
            value={selectedModel} 
            onValueChange={setSelectedModel} 
            disabled={!selectedMake || isLoadingModels}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="Sélectionner le modèle" />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.map((model: VehicleModel) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-1">Moteur</Label>
          <Select 
            value={selectedEngine} 
            onValueChange={setSelectedEngine} 
            disabled={!selectedModel || isLoadingEngines}
          >
            <SelectTrigger id="engine">
              <SelectValue placeholder="Sélectionner le moteur" />
            </SelectTrigger>
            <SelectContent>
              {filteredEngines.map((engine: VehicleEngine) => (
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
              Trouver des pièces
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleSelector;
