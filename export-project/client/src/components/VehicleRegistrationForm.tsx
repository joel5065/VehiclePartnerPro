import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserVehicleSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getVehicleMakes, getVehicleModels, getVehicleEngines, registerVehicle } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getYearRange } from "../lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = insertUserVehicleSchema.extend({
  makeId: z.string().min(1, "Make is required"),
  modelId: z.string().min(1, "Model is required"),
  year: z.string().min(1, "Year is required"),
  engineId: z.string().optional(),
  mileage: z.string().min(1, "Current mileage is required")
    .transform(val => parseInt(val)),
  purchaseDate: z.string().optional(),
  annualMileage: z.enum(["5000", "10000", "15000", "20000", "25000"]).optional(),
});

interface VehicleRegistrationFormProps {
  onSubmitSuccess?: (vehicleId: number) => void;
}

const VehicleRegistrationForm = ({ onSubmitSuccess }: VehicleRegistrationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      makeId: "",
      modelId: "",
      year: "",
      engineId: "",
      mileage: "",
      purchaseDate: "",
      annualMileage: "10000",
      harshWeather: false,
      cityDriving: false,
      regularTowing: false,
    },
  });
  
  const years = getYearRange(1990);
  
  const { data: makes = [] } = useQuery({
    queryKey: ["/api/vehicle-makes"],
  });
  
  const { data: models = [] } = useQuery({
    queryKey: ["/api/vehicle-models", form.watch("makeId")],
    enabled: !!form.watch("makeId"),
  });
  
  const { data: engines = [] } = useQuery({
    queryKey: ["/api/vehicle-engines", form.watch("modelId")],
    enabled: !!form.watch("modelId"),
  });
  
  const filteredModels = form.watch("makeId")
    ? models.filter((model: any) => model.makeId === parseInt(form.watch("makeId")))
    : [];
    
  const filteredEngines = form.watch("modelId")
    ? engines.filter((engine: any) => engine.modelId === parseInt(form.watch("modelId")))
    : [];
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register a vehicle",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const vehicle = await registerVehicle({
        userId: user.id,
        makeId: parseInt(data.makeId),
        modelId: parseInt(data.modelId),
        year: parseInt(data.year),
        engineId: data.engineId ? parseInt(data.engineId) : undefined,
        mileage: data.mileage,
        purchaseDate: data.purchaseDate || undefined,
        annualMileage: data.annualMileage ? parseInt(data.annualMileage) : undefined,
        harshWeather: data.harshWeather,
        cityDriving: data.cityDriving,
        regularTowing: data.regularTowing,
      });
      
      toast({
        title: "Vehicle Registered",
        description: "Your vehicle has been successfully registered",
      });
      
      form.reset();
      
      if (onSubmitSuccess) {
        onSubmitSuccess(vehicle.id);
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register your vehicle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Year*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="makeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Make*</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset dependent fields
                        form.setValue("modelId", "");
                        form.setValue("engineId", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Make" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {makes.map((make: any) => (
                          <SelectItem key={make.id} value={make.id.toString()}>
                            {make.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Model*</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset dependent field
                        form.setValue("engineId", "");
                      }}
                      value={field.value}
                      disabled={!form.watch("makeId")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredModels.map((model: any) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="engineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trim/Engine</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.watch("modelId")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Trim/Engine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredEngines.map((engine: any) => (
                          <SelectItem key={engine.id} value={engine.id.toString()}>
                            {engine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Mileage*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="e.g. 45000"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Driving Habits</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="annualMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Annual Mileage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Annual Mileage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5000">Less than 5,000 miles</SelectItem>
                          <SelectItem value="10000">5,000 - 10,000 miles</SelectItem>
                          <SelectItem value="15000">10,001 - 15,000 miles</SelectItem>
                          <SelectItem value="20000">15,001 - 20,000 miles</SelectItem>
                          <SelectItem value="25000">More than 20,000 miles</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="harshWeather"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-gray-700">
                          Harsh Weather Conditions
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cityDriving"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-gray-700">
                          Mostly City Driving
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="regularTowing"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-gray-700">
                          Regular Towing
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Generating..." : "Generate Maintenance Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VehicleRegistrationForm;
