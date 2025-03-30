import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatRating } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { Star, StarHalf } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    rating: number;
    reviewCount: number;
    isTopRated?: boolean;
    isOnSale?: boolean;
    salePrice?: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  
  // Convert rating from 0-500 to 0-5 stars
  const rating = formatRating(product.rating);
  
  // Generate star display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
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
  
  const handleAddToCart = () => {
    addItem(product.id, 1);
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 h-full">
      <div className="relative">
        {product.imageUrl && (
          <img 
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        {product.isTopRated && (
          <Badge className="absolute top-2 right-2 bg-amber-500">Top Rated</Badge>
        )}
        {product.isOnSale && (
          <Badge className="absolute top-2 right-2 bg-primary">Sale</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-lg mb-2 text-gray-800 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        <div className="flex items-center mb-3">
          <div className="flex text-amber-500">
            {renderStars()}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg">
              {product.isOnSale && product.salePrice
                ? formatPrice(product.salePrice)
                : formatPrice(product.price)}
            </span>
            {product.isOnSale && product.salePrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <Button 
            size="sm"
            className="bg-primary hover:bg-red-600 text-white"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
