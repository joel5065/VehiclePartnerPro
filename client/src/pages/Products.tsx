import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getProducts, getCategories } from "../lib/api";
import VehicleSelector from "../components/VehicleSelector";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [selectedMake, setSelectedMake] = useState<string>(searchParams.get("make") || "");
  const [selectedModel, setSelectedModel] = useState<string>(searchParams.get("model") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlySale, setShowOnlySale] = useState(searchParams.get("sale") === "true");
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch products based on filters
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products", selectedCategory, selectedMake, selectedModel, searchQuery, showOnlySale],
    queryFn: async () => {
      if (searchQuery) {
        return await getProducts().then(products => 
          products.filter((p: any) => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        let categoryId = selectedCategory ? parseInt(selectedCategory) : undefined;
        let compatibleWith = selectedModel ? parseInt(selectedModel) : undefined;
        return await getProducts(categoryId, compatibleWith);
      }
    }
  });

  // Fetch categories for filter sidebar
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Apply client-side filters
  const filteredProducts = products
    .filter((product: any) => {
      // Apply price filter
      const price = product.salePrice || product.price;
      if (price < priceRange[0] * 100 || price > priceRange[1] * 100) {
        return false;
      }
      
      // Apply in-stock filter
      if (showOnlyInStock && product.inStock <= 0) {
        return false;
      }
      
      // Apply sale filter
      if (showOnlySale && !product.isOnSale) {
        return false;
      }
      
      return true;
    });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case "price-low":
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case "price-high":
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.id - a.id; // Using ID as a proxy for newest
      default:
        return 0; // relevance - keep original order
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the current search query
  };

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedMake(vehicle.makeId);
    setSelectedModel(vehicle.modelId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("shop_parts_title")}</h1>
      
      {/* Vehicle selector */}
      <div className="mb-8">
        <VehicleSelector 
          variant="compact" 
          onSelectVehicle={handleVehicleSelect} 
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters - Desktop */}
        <div className="w-64 hidden md:block">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 sticky top-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              {t("filters")}
            </h2>
            
            <div className="space-y-6">
              {/* Categories filter */}
              <div>
                <h3 className="font-medium mb-2">{t("categories")}</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="all-categories"
                      checked={!selectedCategory}
                      onCheckedChange={(checked) => setSelectedCategory("")}
                    />
                    <Label htmlFor="all-categories" className="ml-2">{t("all_categories")}</Label>
                  </div>
                  
                  {isLoadingCategories ? (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    categories.map((category: any) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategory === category.id.toString()}
                          onCheckedChange={(checked) => setSelectedCategory(checked ? category.id.toString() : "")}
                        />
                        <Label htmlFor={`category-${category.id}`} className="ml-2">{category.name}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Price Range filter */}
              <div>
                <h3 className="font-medium mb-2">{t("price_range")}</h3>
                <div className="pt-2 px-2">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={500}
                    step={10}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span>{priceRange[0]} FCFA</span>
                    <span>{priceRange[1]} FCFA</span>
                  </div>
                </div>
              </div>
              
              {/* Other filters */}
              <div>
                <h3 className="font-medium mb-2">{t("availability")}</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="in-stock"
                      checked={showOnlyInStock}
                      onCheckedChange={(checked) => setShowOnlyInStock(!!checked)}
                    />
                    <Label htmlFor="in-stock" className="ml-2">{t("in_stock_only")}</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="on-sale"
                      checked={showOnlySale}
                      onCheckedChange={(checked) => setShowOnlySale(!!checked)}
                    />
                    <Label htmlFor="on-sale" className="ml-2">{t("on_sale")}</Label>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCategory("");
                  setPriceRange([0, 10000]);
                  setShowOnlyInStock(false);
                  setShowOnlySale(false);
                }}
              >
                {t("reset_filters")}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Filters */}
        <div className="md:hidden sticky top-0 z-10 bg-white pb-4">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="mb-4">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 py-4">
                {/* Categories filter */}
                <div>
                  <h3 className="font-medium mb-2">Catégories</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-all-categories"
                        checked={!selectedCategory}
                        onCheckedChange={() => setSelectedCategory("")}
                      />
                      <Label htmlFor="mobile-all-categories" className="ml-2">Toutes les Catégories</Label>
                    </div>
                    
                    {categories.map((category: any) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`mobile-category-${category.id}`}
                          checked={selectedCategory === category.id.toString()}
                          onCheckedChange={() => {
                            setSelectedCategory(category.id.toString());
                            setFiltersOpen(false);
                          }}
                        />
                        <Label htmlFor={`mobile-category-${category.id}`} className="ml-2">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range filter */}
                <div>
                  <h3 className="font-medium mb-2">Prix</h3>
                  <div className="pt-2 px-2">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={500}
                      step={10}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                {/* Other filters */}
                <div>
                  <h3 className="font-medium mb-2">Disponibilité</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-in-stock"
                        checked={showOnlyInStock}
                        onCheckedChange={(checked) => setShowOnlyInStock(!!checked)}
                      />
                      <Label htmlFor="mobile-in-stock" className="ml-2">Seulement en stock</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-on-sale"
                        checked={showOnlySale}
                        onCheckedChange={(checked) => setShowOnlySale(!!checked)}
                      />
                      <Label htmlFor="mobile-on-sale" className="ml-2">En solde</Label>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedCategory("");
                    setPriceRange([0, 10000]);
                    setShowOnlyInStock(false);
                    setShowOnlySale(false);
                    setFiltersOpen(false);
                  }}
                >
                  Reset Filters
                </Button>
                
                <Button
                  className="w-full bg-primary hover:bg-red-600"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Products Content */}
        <div className="flex-1">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Recherche"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Button 
                  type="submit"
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("sort_by")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t("relevance")}</SelectItem>
                <SelectItem value="price-low">{t("price_low_high")}</SelectItem>
                <SelectItem value="price-high">{t("price_high_low")}</SelectItem>
                <SelectItem value="rating">{t("top_rated")}</SelectItem>
                <SelectItem value="newest">{t("newest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Products Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex items-center mb-3">
                      <div className="flex space-x-1">
                        {Array(5).fill(0).map((_, j) => (
                          <div key={j} className="w-4 h-4 bg-gray-200 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">{t("no_products_found")}</h3>
              <p className="text-gray-600 mb-4">{t("try_adjusting_search")}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setPriceRange([0, 10000]);
                  setShowOnlyInStock(false);
                  setShowOnlySale(false);
                }}
              >
                {t("clear_all_filters")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
