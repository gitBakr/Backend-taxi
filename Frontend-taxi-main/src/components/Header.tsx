import { Menu, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">
              TaxiConnect
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 mr-6">
              <a href="#services" className="text-gray-600 hover:text-primary transition-colors">Nos Services</a>
              <a href="#destinations" className="text-gray-600 hover:text-primary transition-colors">Destinations</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Témoignages</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
            </nav>
            <Button variant="ghost" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              FR
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Connexion
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              S'inscrire
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <a href="#services" className="px-4 py-2 hover:bg-primary/5 rounded-md">Nos Services</a>
              <a href="#destinations" className="px-4 py-2 hover:bg-primary/5 rounded-md">Destinations</a>
              <a href="#testimonials" className="px-4 py-2 hover:bg-primary/5 rounded-md">Témoignages</a>
              <a href="#contact" className="px-4 py-2 hover:bg-primary/5 rounded-md">Contact</a>
              <div className="border-t border-gray-200 my-2"></div>
              <Button variant="ghost" className="flex items-center gap-2 justify-start">
                <Globe className="w-4 h-4" />
                FR
              </Button>
              <Button variant="ghost" className="flex items-center gap-2 justify-start">
                <User className="w-4 h-4" />
                Connexion
              </Button>
              <Button className="bg-primary hover:bg-primary/90 mt-2">
                S'inscrire
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};