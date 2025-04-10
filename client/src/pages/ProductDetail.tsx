import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getProduct, getProducts } from "../lib/api";
import { useCart } from "../context/CartContext";
import { formatPrice, formatRating } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "../components/ProductCard";
import {
  Star,
  StarHalf,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ProductDetail = () => {
  const { id } = useParams();
  const productId = parseInt(id as string);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isLoading: isCartLoading } = useCart();
  const { t } = useTranslation();

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    queryFn: () => getProduct(productId),
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      if (!product) return [];
      return getProducts(product.categoryId).then((products) => 
        products.filter((p: any) => p.id !== productId).slice(0, 4)
      );
    },
    enabled: !!product,
  });

  const handleAddToCart = () => {
    addItem(productId, quantity);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  // Convert rating from 0-500 to 0-5 stars
  const renderStars = (rating: number) => {
    const starRating = rating / 100;
    const stars = [];
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-amber-500 text-amber-500" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-amber-500 text-amber-500" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-amber-500" />);
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="md:w-1/2">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="md:w-1/2">
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="flex items-center mb-4">
              <div className="flex space-x-1">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-gray-200 rounded-full"></div>
                ))}
              </div>
              <div className="h-5 bg-gray-200 rounded ml-2 w-16"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-12 bg-gray-200 rounded w-36"></div>
              <div className="h-12 bg-gray-200 rounded w-36"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Produit non trouvé</h1>
        <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
        <Button asChild>
          <Link href="/products">Continuer vos achats</Link>
        </Button>
      </div>
    );
  }

  const isOnSale = product.isOnSale && product.salePrice;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/products" className="text-primary hover:underline">
          &larr; Retour aux Produits
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Product Images */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Aucune image disponible</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          {product.compatibleVehicles && product.compatibleVehicles.length > 0 && (
            <p className="text-gray-600 mb-4">{t("compatible_with_multiple_vehicles")}</p>
          )}
          
          <div className="flex items-center mb-4">
            <div className="flex">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-gray-600 ml-2">({product.reviewCount} {t("reviews")})</span>
          </div>
          
          <div className="mb-6">
            {isOnSale ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-3">{formatPrice(product.salePrice)}</span>
                <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
                <Badge className="ml-3 bg-primary">{t("sale")}</Badge>
              </div>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
          
          <div className="prose max-w-none mb-6">
            <p>{t(`product_description_${product.id}`)}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
              <span>{t("guaranteed_fit")}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Truck className="h-5 w-5 mr-2 text-green-500" />
              <span>{t("free_shipping_over_50")}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <RotateCcw className="h-5 w-5 mr-2 text-green-500" />
              <span>{t("ninety_day_returns")}</span>
            </div>
          </div>
          
          <Card className="mb-6 p-4 bg-gray-50">
            <div className="flex items-center">
              <span className="mr-4">Quantité:</span>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={quantity >= 10}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center text-green-600 mb-2">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>{product.inStock > 0 ? `In Stock (${product.inStock} available)` : "Out of Stock"}</span>
              </div>
            </div>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleAddToCart} 
              disabled={isCartLoading || product.inStock <= 0}
              className="bg-primary hover:bg-red-600 h-12"
              size="lg"
            >
              {isCartLoading ? "Adding..." : "Add to Cart"}
            </Button>
            <Button asChild variant="outline" className="h-12" size="lg">
              <Link href="/maintenance">Trouver le Plan de Maintenance</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mb-12">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">{t("details")}</TabsTrigger>
            <TabsTrigger value="specifications">{t("specifications")}</TabsTrigger>
            <TabsTrigger value="fitment">{t("vehicle_fitment")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("reviews")}</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-4">
            <div className="prose max-w-none">
              <h3>{t("product_details")}</h3>
              <p>{t(`product_description_${product.id}`)}</p>
              <ul>
                <li>{t("high_quality_construction")}</li>
                <li>{t("oem_specifications")}</li>
                <li>{t("rigorously_tested")}</li>
                <li>{t("easy_installation")}</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="pt-4">
            <div className="prose max-w-none">
              <h3>{t("specifications")}</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-semibold pr-4 py-2">{t("brand")}</td>
                    <td>AutoParts Plus</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2">{t("part_number")}</td>
                    <td>AP-{product.id.toString().padStart(6, '0')}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2">{t("warranty")}</td>
                    <td>{t("one_year_warranty")}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-4 py-2">{t("material")}</td>
                    <td>{t("premium_quality_materials")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="fitment" className="pt-4">
            <div className="prose max-w-none">
              <h3>Compatibilité des Véhicules</h3>
              <p>Ce produit est compatible avec les véhicules suivants:</p>
              <ul>
                <li>Toyota Camry (2018-2022)</li>
                <li>Toyota Corolla (2019-2022)</li>
                <li>Toyota RAV4 (2019-2022)</li>
                <li>Et plus - utilisez le sélecteur de véhicule pour vérifier la compatibilité avec votre véhicule spécifique</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-4">
            <div className="prose max-w-none">
              <h3>Avis des Clients</h3>
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">Basé sur {product.reviewCount} avis</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="flex mr-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className="fill-amber-500 text-amber-500 h-4 w-4" />
                      ))}
                    </div>
                    <span className="font-medium">John D.</span>
                    <span className="text-sm text-gray-500 ml-2">Avis vérifié</span>
                  </div>
                  <p className="text-sm">Parfait pour mon Toyota Camry. Facile à installer et fonctionne très bien.</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center mb-1">
                    <div className="flex mr-2">
                      {Array(4).fill(0).map((_, i) => (
                        <Star key={i} className="fill-amber-500 text-amber-500 h-4 w-4" />
                      ))}
                    </div>
                    <span className="font-medium">Sarah M.</span>
                    <span className="text-sm text-gray-500 ml-2">Avis vérifié</span>
                  </div>
                  <p className="text-sm">Produit de qualité. Le transport était rapide.</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center mb-1">
                    <div className="flex mr-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className="fill-amber-500 text-amber-500 h-4 w-4" />
                      ))}
                    </div>
                    <span className="font-medium">Robert L.</span>
                     <span className="text-sm text-gray-500 ml-2">Avis vérifié</span>
                  </div>
                  <p className="text-sm">Exactement ce dont j'avais besoin. C'est la troisième fois que je commande chez AutoParts Plus et ils ne m'ont jamais déçus.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Produits Relatifs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct: any) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
