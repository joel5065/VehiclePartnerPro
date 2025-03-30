import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  testimonial: {
    text: string;
    author: string; 
    vehicle: string;
    rating: number;
    avatarUrl?: string;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  // Generate star display
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < testimonial.rating; i++) {
      stars.push(<Star key={i} className="fill-amber-500 text-amber-500" />);
    }
    return stars;
  };
  
  return (
    <Card className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
      <CardContent className="p-0">
        <div className="flex text-amber-500 mb-3">
          {renderStars()}
        </div>
        <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
            {testimonial.avatarUrl ? (
              <img 
                src={testimonial.avatarUrl} 
                alt={testimonial.author} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-semibold">
                {testimonial.author.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium">{testimonial.author}</h4>
            <p className="text-sm text-gray-600">{testimonial.vehicle} Propriétaire</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
