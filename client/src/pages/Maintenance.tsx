import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getUserVehicles, getMaintenanceSchedule } from "../lib/api";
import { mapMaintenanceItemsToSchedule } from "../lib/utils";
import VehicleRegistrationForm from "../components/VehicleRegistrationForm";
import MaintenanceSchedule from "../components/MaintenanceSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Car, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Maintenance = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("register");
  
  // Fetch user vehicles if authenticated
  const { data: userVehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["/api/user-vehicles", user?.id],
    queryFn: () => getUserVehicles(user?.id as number),
    enabled: !!user
  });
  
  // Fetch maintenance schedule for selected vehicle
  const { data: maintenanceItems = [], isLoading: isLoadingSchedule } = useQuery({
    queryKey: ["/api/maintenance-schedule", selectedVehicleId],
    queryFn: () => getMaintenanceSchedule(selectedVehicleId as number),
    enabled: !!selectedVehicleId
  });
  
  // Convert maintenance items to schedule format
  const schedule = mapMaintenanceItemsToSchedule(maintenanceItems);
  
  const handleVehicleRegistered = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setActiveTab("schedule");
  };
  
  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setActiveTab("schedule");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Vehicle Maintenance Planner</h1>
          <p className="text-gray-600">Keep your vehicle in top condition with a personalized maintenance schedule</p>
        </div>
        
        {!isAuthenticated ? (
          <Alert variant="warning" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please <a href="/login" className="font-medium underline">sign in</a> or <a href="/register" className="font-medium underline">register</a> to create a personalized maintenance plan.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="register">Register Vehicle</TabsTrigger>
              <TabsTrigger value="schedule" disabled={userVehicles.length === 0 && !selectedVehicleId}>
                Maintenance Schedule
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="register">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Register New Vehicle</h2>
                <VehicleRegistrationForm onSubmitSuccess={handleVehicleRegistered} />
              </div>
              
              {userVehicles.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Your Registered Vehicles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoadingVehicles ? (
                      Array(2).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-full"></div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      userVehicles.map((vehicle: any) => (
                        <Card key={vehicle.id} className={vehicle.id === selectedVehicleId ? "border-primary" : ""}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {vehicle.year} {vehicle.makeName} {vehicle.modelName}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  Current Mileage: {vehicle.mileage.toLocaleString()} miles
                                </p>
                                {vehicle.engineName && (
                                  <p className="text-gray-600 text-sm">{vehicle.engineName}</p>
                                )}
                              </div>
                              <Car className="h-6 w-6 text-gray-400" />
                            </div>
                            <Button
                              onClick={() => handleVehicleSelect(vehicle.id)}
                              className="w-full mt-4"
                              variant={vehicle.id === selectedVehicleId ? "default" : "outline"}
                            >
                              View Maintenance Schedule
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="schedule">
              {isLoadingSchedule ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-8 w-1/2"></div>
                  <div className="space-y-4">
                    {Array(7).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : selectedVehicleId ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Your Maintenance Schedule</h2>
                  <p className="text-gray-600 mb-6">
                    Based on your vehicle information and driving habits, here's your recommended maintenance schedule:
                  </p>
                  <MaintenanceSchedule schedule={schedule} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No Vehicle Selected</h3>
                  <p className="text-gray-600 mb-4">Please register a vehicle or select one from your list to view the maintenance schedule.</p>
                  <Button onClick={() => setActiveTab("register")}>Register a Vehicle</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
