import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, ShoppingCart, Calendar, ChevronDown } from "lucide-react";

const Header = () => {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-secondary text-white">
      {/* Top Bar */}
      <div className="bg-primary py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="text-xs md:text-sm">Free shipping on orders over $50</p>
          <div className="flex items-center space-x-4">
            <Link href="/help" className="text-xs md:text-sm hover:underline">Help</Link>
            <Link href="/orders" className="text-xs md:text-sm hover:underline">Track Order</Link>
            <Link href="/contact" className="text-xs md:text-sm hover:underline">Contact</Link>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-3 md:mb-0">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-primary">Auto</span>Parts<span className="text-amber-500">Plus</span>
          </Link>
        </div>
        
        <div className="w-full md:w-2/5 mb-3 md:mb-0">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search parts, categories, or vehicle..." 
              className="w-full py-2 px-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit"
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center hover:text-amber-500">
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline">{user?.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Order History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="flex items-center hover:text-amber-500">
              <User className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Login</span>
            </Link>
          )}
          
          <Link href="/maintenance" className="flex items-center hover:text-amber-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Maintenance</span>
          </Link>
          
          <Button 
            variant="ghost" 
            className="flex items-center hover:text-amber-500 p-0"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="relative">
              <ShoppingCart className="h-4 w-4 mr-1" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full text-xs px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline">Cart</span>
          </Button>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="bg-gray-700">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap items-center">
            <li>
              <Link href="/" className="py-2 px-3 hover:bg-gray-600 block">
                Home
              </Link>
            </li>
            <li className="relative group">
              <div className="py-2 px-3 hover:bg-gray-600 cursor-pointer flex items-center">
                <span>Shop by Category</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </div>
              <div className="absolute left-0 mt-0 w-48 bg-white text-gray-800 shadow-lg rounded-md hidden group-hover:block z-10">
                <Link href="/products?category=1" className="block px-4 py-2 hover:bg-gray-100">Oil & Fluids</Link>
                <Link href="/products?category=2" className="block px-4 py-2 hover:bg-gray-100">Batteries</Link>
                <Link href="/products?category=3" className="block px-4 py-2 hover:bg-gray-100">Engine Parts</Link>
                <Link href="/products?category=4" className="block px-4 py-2 hover:bg-gray-100">Brakes</Link>
                <Link href="/products?category=5" className="block px-4 py-2 hover:bg-gray-100">Electrical</Link>
                <Link href="/products?category=6" className="block px-4 py-2 hover:bg-gray-100">Filters</Link>
              </div>
            </li>
            <li className="relative group">
              <div className="py-2 px-3 hover:bg-gray-600 cursor-pointer flex items-center">
                <span>Shop by Vehicle</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </div>
              <div className="absolute left-0 mt-0 w-48 bg-white text-gray-800 shadow-lg rounded-md hidden group-hover:block z-10">
                <Link href="/products?make=1" className="block px-4 py-2 hover:bg-gray-100">Toyota</Link>
                <Link href="/products?make=2" className="block px-4 py-2 hover:bg-gray-100">Honda</Link>
                <Link href="/products?make=3" className="block px-4 py-2 hover:bg-gray-100">Ford</Link>
                <Link href="/products?make=4" className="block px-4 py-2 hover:bg-gray-100">Chevrolet</Link>
                <Link href="/products?make=5" className="block px-4 py-2 hover:bg-gray-100">BMW</Link>
              </div>
            </li>
            <li>
              <Link href="/products?sale=true" className="py-2 px-3 hover:bg-gray-600 block">
                Deals
              </Link>
            </li>
            <li>
              <Link href="/maintenance" className="py-2 px-3 hover:bg-gray-600 block">
                Maintenance
              </Link>
            </li>
            <li>
              <Link href="/guides" className="py-2 px-3 hover:bg-gray-600 block">
                DIY Guides
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
