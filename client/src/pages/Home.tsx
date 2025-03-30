import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProducts } from "../lib/api";
import VehicleSelector from "../components/VehicleSelector";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import TestimonialCard from "../components/TestimonialCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const Home = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
  });

  // Testimonials data
  const testimonials = [
    {
      text: "Le plan de maintenance est incroyablement utile. J'ai économisé beaucoup d'argent en faisant les services recommandés aux bon moments. Plus, les pièces sont de haute qualité et s'adaptent parfaitement.",
      author: "Robert Johnson",
      vehicle: "Toyota Camry",
      rating: 5,
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      text: "Livraison rapide et les pièces sont arrivées exactement comme décrites. Les rappels de maintenance sont un sauveur - je ne manque jamais un changement d'huile maintenant. Service client excellent!",
      author: "Sarah Williams",
      vehicle: "Honda Civic",
      rating: 4,
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      text: "Comme quelqu'un qui ne sait pas grand-chose de voitures, ce site m'a été précieux. Le plan de maintenance est clair et les guides DIY m'ont aidé à gérer des tâches simples moi-même.",
      author: "Michael Chen",
      vehicle: "Ford Explorer",
      rating: 5,
      avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    // Redirect to products page with the selected vehicle
    window.location.href = `/products?year=${vehicle.year}&make=${vehicle.makeId}&model=${vehicle.modelId}&engine=${vehicle.engineId || ''}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary to-gray-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Pièces de Voitures de Qualité & Plans de Maintenance Personnalisés</h1>
              <p className="text-lg mb-6">Obtenez les bonnes pièces pour votre véhicule et un plan de maintenance personnalisé pour le garder en bon état.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-red-600 text-white font-medium py-3 px-6 rounded-md"
                >
                  <Link href="/products">Achat Pièces de Voitures</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-md"
                >
                  <Link href="/maintenance">Créer votre plan de Maintenance</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
                alt="Auto parts and mechanic tools"
                className="rounded-lg shadow-lg"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Selector Section */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <VehicleSelector onSelectVehicle={handleSelectVehicle} />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Catégories Populaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoadingCategories ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 text-center animate-pulse">
                  <div className="bg-gray-200 rounded-full w-16 h-16 mx-auto mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))
            ) : (
              categories.map((category: any) => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Produits en vedette</h2>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoadingProducts ? (
              Array(4).fill(0).map((_, i) => (
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
              ))
            ) : (
              featuredProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          <div className="text-center mt-8">
            <Button 
              asChild
              variant="outline"
              className="border border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Link href="/products">Voir tous les produits</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Maintenance Plan Preview Section */}
      <section id="maintenance-preview" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Plan de Maintenance d'Exemple</h2>
            <p className="text-gray-600">Voici à quoi ressemblera votre plan de maintenance personnalisé</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Service</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">5,000 miles</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">10,000 miles</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">15,000 miles</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">30,000 miles</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">60,000 miles</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Oil Change</td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Tire Rotation</td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Air Filter</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Cabin Filter</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Brake Inspection</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Transmission Fluid</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">Spark Plugs</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4"><Check className="text-green-500 h-5 w-5" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 max-w-3xl mx-auto bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Votre Plan Personnalisé Comprend:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
                <span>Plan de maintenance détaillé basé sur votre véhicule et vos habitudes de conduite</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
                <span>Rappels par email ou texte lorsque le service est dû</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
                <span>Suivi de l'historique de service et de l'enregistrement</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
                <span>Pièces recommandées pour votre véhicule spécifique</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
                <span>Guides DIY et tutoriels vidéo pour les tâches de maintenance courantes</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Ce Que Nos Clients Disent</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à garder votre véhicule en bon état?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">Obtenez des pièces de qualité livrées à votre porte et n'oubliez jamais les importantes tâches de maintenance avec votre plan de service personnalisé.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-red-600 text-white"
            >
              <Link href="/products">Acheter des pièces maintenant</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white hover:bg-gray-100 text-secondary"
            >
              <Link href="/maintenance">Créer votre plan de Maintenance</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
