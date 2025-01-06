import { Calendar, CheckSquare, Car } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Réservez",
    description: "Choisissez votre trajet et horaire",
  },
  {
    icon: CheckSquare,
    title: "Confirmez",
    description: "Un chauffeur accepte votre course",
  },
  {
    icon: Car,
    title: "Voyagez",
    description: "Profitez d'un trajet confortable",
  },
];

export const HowItWorks = () => {
  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Comment ça marche</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.title} className="relative flex flex-col items-center">
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/20 to-secondary/20" />
            )}
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-full p-4 shadow-lg mb-4 border border-gray-100">
              <step.icon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{step.title}</h3>
            <p className="text-gray-600 text-center">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};