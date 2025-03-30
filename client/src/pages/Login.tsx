import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const redirect = searchParams.get("redirect") || "/";
  
  const { login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoginError(null);
    const success = await login(data);
    
    if (success) {
      navigate(redirect);
    } else {
      setLoginError("Mot de passe ou nom d'utilisateur incorrect");
    }
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion à votre compte</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {loginError && (
                <div className="text-sm text-red-500 font-medium">
                  {loginError}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-red-600" 
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Connexion"}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-primary hover:underline">
              Mot de passe oublié?
            </a>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Pas de compte?
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Créer un compte</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center px-8 pt-0">
          <p className="text-xs text-gray-500 text-center">
            En vous connectant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
