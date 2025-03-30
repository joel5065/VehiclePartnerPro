import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart } from "../lib/api";
import { useAuth } from "./AuthContext";

interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  addedAt: string;
  product?: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    salePrice?: number;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearAllItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate cart count and total
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    if (!item.product) return total;
    const price = item.product.salePrice || item.product.price;
    return total + (price * item.quantity);
  }, 0);

  // Fetch cart items when user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const cartData = await getCart(user.id);
      setCartItems(cartData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger votre panier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (productId: number, quantity: number) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour ajouter des articles à votre panier",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await addToCart({
        userId: user.id,
        productId,
        quantity,
      });
      
      toast({
        title: "Succès",
        description: "Article ajouté à votre panier",
      });
      
      await refreshCart();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article à votre panier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    setIsLoading(true);
    try {
      await updateCartItemQuantity(itemId, quantity);
      await refreshCart();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité de l'article",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setIsLoading(true);
    try {
      await removeCartItem(itemId);
      await refreshCart();
      
      toast({
        title: "Succès",
        description: "Article retiré de votre panier",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer l'article de votre panier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await clearCart(user.id);
      setCartItems([]);
      
      toast({
        title: "Succès",
        description: "Votre panier a été vidé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vider votre panier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        cartCount,
        cartTotal,
        addItem,
        updateQuantity,
        removeItem,
        clearAllItems,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart doit être utilisé dans un CartProvider");
  }
  return context;
}
