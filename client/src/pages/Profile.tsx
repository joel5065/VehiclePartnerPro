import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getUserVehicles } from "../lib/api";
import { AlertCircle, Car } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "Nom de famille est requis"),
  lastName: z.string().min(1, "Nom de famille est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel est requis"),
  newPassword: z.string().min(6, "Nouveau mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const Profile = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login?redirect=profile");
    return null;
  }
  
  // Fetch user vehicles
  const { data: userVehicles = [] } = useQuery({
    queryKey: ["/api/user-vehicles", user?.id],
    enabled: !!user,
  });
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
    },
  });
  
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const handleProfileUpdate = async (data: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    
    // In a real app, we would update the user profile
    // For now, we'll just show a success toast
    setTimeout(() => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations de profil ont été mises à jour.",
      });
      setIsUpdating(false);
    }, 1000);
  };
  
  const handlePasswordChange = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsUpdating(true);
    
    // In a real app, we would update the password
    // For now, we'll just show a success toast
    setTimeout(() => {
      toast({
        title: "Mot de passe changé",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
      passwordForm.reset();
      setIsUpdating(false);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon Compte</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <span className="text-2xl font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                <TabsList className="flex flex-col h-auto">
                  <TabsTrigger value="details" className="justify-start">
                    Détails du compte
                  </TabsTrigger>
                  <TabsTrigger value="password" className="justify-start">
                    Mot de passe
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="justify-start">
                    Mes véhicules
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Separator className="my-6" />
              
              <Button 
                variant="outline" 
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={logout}
              >
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du compte</CardTitle>
                  <CardDescription>Mettre à jour vos informations de compte</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de famille</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-3">Informations de l'adresse</h3>
                        
                        <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <FormField
                            control={profileForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>État</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Code postal</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-red-600"
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Mise à jour en cours..." : "Mettre à jour le profil"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Changer le mot de passe</CardTitle>
                  <CardDescription>Mettre à jour votre mot de passe de compte</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe actuel</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Alert variant="default" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          Après avoir changé votre mot de passe, vous serez déconnecté et devrez vous reconnecter.
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-red-600 mt-4"
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Mise à jour en cours..." : "Changer le mot de passe"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle>Mes véhicules</CardTitle>
                  <CardDescription>Gerer vos véhicules enregistrés</CardDescription>
                </CardHeader>
                <CardContent>
                  {userVehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun véhicule enregistré</h3>
                      <p className="text-gray-600 mb-4">Vous n'avez pas encore enregistré de véhicules.</p>
                      <Button asChild>
                        <a href="/maintenance">Enregistrer un véhicule</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userVehicles.map((vehicle: any) => (
                        <Card key={vehicle.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {vehicle.year} {vehicle.makeName} {vehicle.modelName}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  Kilométrage: {vehicle.mileage.toLocaleString()} km
                                </p>
                                {vehicle.engineName && (
                                  <p className="text-gray-600 text-sm">{vehicle.engineName}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button asChild variant="outline" size="sm">
                                  <a href={`/maintenance?vehicle=${vehicle.id}`}>Voir le plan</a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <div className="mt-4">
                        <Button asChild>
                          <a href="/maintenance">Enregistrer un nouveau véhicule</a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
