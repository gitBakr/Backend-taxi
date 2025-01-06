import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const destinations = [
  {
    id: 1,
    name: "Tunis",
    image: "https://source.unsplash.com/1506744038136-46273834b3fb",
    description: "Découvrez la capitale tunisienne, son histoire et sa culture",
    price: 45,
    duration: "45 min",
  },
  {
    id: 2,
    name: "Sfax",
    image: "https://source.unsplash.com/1500673922987-e212871fec22",
    description: "Visitez la capitale économique et son patrimoine historique",
    price: 65,
    duration: "1h",
  },
  {
    id: 3,
    name: "Sousse",
    image: "https://source.unsplash.com/1482938289607-e9573fc25ebb",
    description: "Profitez des plages et de la médina de Sousse",
    price: 55,
    duration: "50 min",
  },
];

export const PopularDestinations = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white" id="destinations">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Destinations populaires
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <CardHeader className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                    {destination.name}
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-600 mb-4">{destination.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    Durée: <span className="font-semibold">{destination.duration}</span>
                  </p>
                  <p className="text-primary font-bold">
                    À partir de {destination.price} DT
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Réserver maintenant
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};