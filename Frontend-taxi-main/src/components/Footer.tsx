import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { Button } from "./ui/button";

export const Footer = () => {
  return (
    <footer className="bg-primary/5 mt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">TaxiConnect</h3>
            <p className="text-gray-600">
              Votre solution de transport interurbain fiable et confortable en Tunisie.
            </p>
          </div>

          {/* Liens Utiles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Liens Utiles</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-primary">À propos</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Nos services</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Tarifs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-600">+216 XX XXX XXX</li>
              <li className="text-gray-600">contact@taxiconnect.tn</li>
              <li className="text-gray-600">Tunis, Tunisie</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Newsletter</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="px-4 py-2 border rounded-md flex-1"
              />
              <Button size="sm">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-600 hover:text-primary">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          © 2024 TaxiConnect. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};