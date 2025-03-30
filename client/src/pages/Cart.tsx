import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeItem, clearAllItems, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const shipping = cartTotal >= 5000 ? 0 : 799; // Free shipping over $50
  const tax = Math.round(cartTotal * 0.0725); // 7.25% tax rate
  const orderTotal = cartTotal + shipping + tax;

  const handleClearCart = () => {
    clearAllItems();
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      setPromoCode("");
      // Show error toast - no valid promo codes
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Items ({cartItems.length})</h2>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500 flex items-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all items from your cart. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleClearCart}
                      >
                        Clear Cart
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <Separator className="mb-6" />
              
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row border-b pb-6">
                    <div className="sm:w-1/4 mb-4 sm:mb-0">
                      {item.product?.imageUrl && (
                        <img 
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                    <div className="sm:w-3/4 sm:pl-6 flex flex-col">
                      <div className="flex justify-between mb-2">
                        <Link 
                          href={`/products/${item.productId}`}
                          className="text-lg font-medium hover:text-primary"
                        >
                          {item.product?.name}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {item.product?.description?.substring(0, 100)}
                        {item.product?.description?.length > 100 ? "..." : ""}
                      </p>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-3">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice(
                              (item.product?.salePrice || item.product?.price || 0) * item.quantity
                            )}
                          </div>
                          {item.product?.salePrice && item.product?.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(item.product.price * item.quantity)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-6 pt-0">
              <Button 
                variant="outline"
                asChild
              >
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <form onSubmit={handleApplyPromo} className="mt-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      variant="outline"
                      disabled={!promoCode || isApplying}
                    >
                      {isApplying ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                </form>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
              
              {!isAuthenticated ? (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Please sign in to checkout</p>
                    <p className="text-xs text-amber-700 mt-1">
                      You need to be logged in to complete your purchase.
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href="/register">Register</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  asChild
                  className="w-full bg-primary hover:bg-red-600"
                  size="lg"
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              )}
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Secure Checkout</p>
                <p className="mt-1">All transactions are secure and encrypted.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
