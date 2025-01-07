import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Ben Ali",
    image: "/placeholder.svg",
    rating: 5,
    comment: "Service excellent et ponctuel. Le chauffeur était très professionnel.",
  },
  {
    id: 2,
    name: "Mohamed Karim",
    image: "/placeholder.svg",
    rating: 5,
    comment: "Prix transparent et réservation facile. Je recommande !",
  },
  {
    id: 3,
    name: "Leila Mansour",
    image: "/placeholder.svg",
    rating: 4,
    comment: "Très satisfaite de mon trajet. Application pratique et intuitive.",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Ce que disent nos clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-secondary text-secondary"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};