import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    icon?: string;
  };
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  // Map category icons to appropriate Lucide React icons
  const getIconClass = (icon?: string) => {
    switch (icon) {
      case "fa-oil-can":
        return "fa-oil-can";
      case "fa-car-battery":
        return "fa-car-battery";
      case "fa-cogs":
        return "fa-cogs";
      case "fa-compress-arrows-alt":
        return "fa-compress-arrows-alt";
      case "fa-bolt":
        return "fa-bolt";
      case "fa-filter":
        return "fa-filter";
      default:
        return "fa-tools";
    }
  };
  
  return (
    <Link href={`/products?category=${category.id}`}>
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center cursor-pointer">
        <CardContent className="p-0">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <i className={`fas ${getIconClass(category.icon)} text-2xl text-primary`}></i>
          </div>
          <h3 className="font-medium text-gray-800">{category.name}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
