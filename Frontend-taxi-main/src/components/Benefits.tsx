import { Calculator, Shield, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: Calculator,
    title: "Tarifs transparents",
    description: "Prix fixés à l'avance, sans surprises",
  },
  {
    icon: CheckCircle,
    title: "Chauffeurs professionnels",
    description: "Chauffeurs certifiés et expérimentés",
  },
  {
    icon: Shield,
    title: "Paiement sécurisé",
    description: "Paiement en ligne ou en espèces",
  },
];

export const Benefits = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
      {benefits.map((benefit) => (
        <div
          key={benefit.title}
          className="flex flex-col items-center text-center p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
        >
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-4">
            <benefit.icon className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{benefit.title}</h3>
          <p className="text-gray-600">{benefit.description}</p>
        </div>
      ))}
    </div>
  );
};