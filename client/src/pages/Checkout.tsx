import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder, getCart } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Check } from "lucide-react";

const formSchema = z.object({
  shippingAddress: z.string().min(1, "Address is required"),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingZip: z.string().min(5, "ZIP code must be at least 5 characters"),
  paymentMethod: z.enum(["credit", "paypal"], {
    required_error: "Please select a payment method",
  }),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  cardName: z.string().optional(),
});

const Checkout = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearAllItems } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const shipping = cartTotal >= 5000 ? 0 : 799; // Free shipping over $50
  const tax = Math.round(cartTotal * 0.0725); // 7.25% tax
  const orderTotal = cartTotal + shipping + tax;

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login?redirect=checkout");
    return null;
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
      shippingCity: user?.city || "",
      shippingState: user?.state || "",
      shippingZip: user?.zipCode || "",
      paymentMethod: "credit",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      cardName: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare order and items
      const orderData = {
        userId: user.id,
        total: orderTotal,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingZip: data.shippingZip,
      };
      
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.salePrice || item.product?.price || 0,
      }));
      
      await createOrder(orderData, orderItems);
      
      // Clear cart after successful order
      await clearAllItems();
      
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your purchase!",
      });
      
      // Redirect to confirmation page
      navigate("/orders");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de passer commande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = async () => {
    const shippingFields = ["shippingAddress", "shippingCity", "shippingState", "shippingZip"];
    const result = await form.trigger(shippingFields as any);
    if (result) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Passer à la caisse</h1>
      
      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
            {currentStep > 1 ? <Check className="h-6 w-6" /> : "1"}
          </div>
          <div className={`h-1 flex-1 mx-2 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
            {currentStep > 2 ? <Check className="h-6 w-6" /> : "2"}
          </div>
          <div className={`h-1 flex-1 mx-2 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Livraison</span>
          <span>Paiement</span>
          <span>Récapitulatif</span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardContent className="p-6">
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Informations de livraison</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name="shippingAddress"
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
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="shippingCity"
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
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="shippingState"
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
                            control={form.control}
                            name="shippingZip"
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
                      
                      <div className="mt-6 flex justify-end">
                        <Button 
                          type="button" 
                          onClick={goToNextStep}
                          className="bg-primary hover:bg-red-600"
                        >
                          Continuer au paiement
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Méthode de paiement</h2>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="credit" id="credit" />
                                  <label htmlFor="credit" className="flex items-center cursor-pointer">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Carte de crédit
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="paypal" id="paypal" />
                                  <label htmlFor="paypal" className="flex items-center cursor-pointer">
                                    <i className="fab fa-paypal mr-2 text-blue-500"></i>
                                    PayPal
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {paymentMethod === "credit" && (
                        <div className="mt-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom sur la carte</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro de carte</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="**** **** **** ****"
                                    maxLength={19}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="cardExpiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiration (MM/YY)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="MM/YY"
                                      maxLength={5}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="cardCvc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVC</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="***"
                                      maxLength={3}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6 flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={goToPreviousStep}
                        >
                          Retour à la livraison
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-red-600"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "En cours..." : "Passer à la caisse"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Récapitulatif de la commande</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center">
                      <span>{item.quantity}x</span>
                      <span className="ml-2 text-gray-800 truncate max-w-[200px]">
                        {item.product?.name}
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatPrice(
                        (item.product?.salePrice || item.product?.price || 0) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span>{shipping === 0 ? "GRATUIT" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxe estimée</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
