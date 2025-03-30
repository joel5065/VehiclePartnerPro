import { Link } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/utils";
import { Minus, Plus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { cartItems, cartTotal, updateQuantity, removeItem } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold flex justify-between items-center">
            <span>Your Cart ({cartItems.length})</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-4 overflow-y-auto h-[calc(100%-8rem)]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex border-b pb-4">
                  {item.product?.imageUrl && (
                    <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium">{item.product?.name}</h4>
                    <div className="flex justify-between mt-2">
                      <span className="font-bold">
                        {item.product?.salePrice 
                          ? formatPrice(item.product.salePrice)
                          : item.product?.price 
                            ? formatPrice(item.product.price)
                            : "$0.00"
                        }
                      </span>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Shipping</span>
                <span>{cartTotal >= 5000 ? "FREE" : formatPrice(799)}</span>
              </div>
              <Separator />
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="font-bold">{cartTotal >= 5000 ? formatPrice(cartTotal) : formatPrice(cartTotal + 799)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild onClick={onClose} className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" onClick={onClose} className="w-full">
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
