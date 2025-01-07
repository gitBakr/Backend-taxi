import { useState } from 'react';
import { Header } from "@/components/Header";
import { BookingForm } from "@/components/BookingForm";
import { Benefits } from "@/components/Benefits";
import { HowItWorks } from "@/components/HowItWorks";
import { PopularDestinations } from "@/components/PopularDestinations";
import { Testimonials } from "@/components/Testimonials";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Footer } from "@/components/Footer";

interface SearchResult {
  price: number;
  duration: string;
  distance: string;
}

const Index = () => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const handleSearchComplete = (result: SearchResult) => {
    setSearchResult(result);
    // Optionnel : scroll vers les résultats
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center py-4 bg-primary text-white">
        <h2 className="text-xl font-bold">Coucou</h2>
      </div>

      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Voyagez entre villes en toute sérénité
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Réservez votre taxi interurbain en quelques clics
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <BookingForm onSearchComplete={handleSearchComplete} />
            </div>
          </div>
        </div>
      </section>

      {/* Résultats de recherche conditionnels */}
      {searchResult && (
        <section className="py-8 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Résultat de votre recherche</h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">{searchResult.price}€</p>
                <p className="text-gray-600">Durée estimée : {searchResult.duration}</p>
                <p className="text-gray-600">Distance : {searchResult.distance}</p>
                <button className="w-full bg-primary text-white p-3 rounded-md hover:bg-primary/90 mt-4">
                  Confirmer la réservation
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto">
          <Benefits />
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container mx-auto">
          <HowItWorks />
        </div>
      </section>

      {/* Popular Destinations Section */}
      <PopularDestinations />

      {/* Testimonials Section */}
      <section className="py-12 px-4 bg-gradient-to-tr from-secondary/5 to-accent/5">
        <Testimonials />
      </section>

      {/* Footer */}
      <Footer />

      {/* Theme Switcher */}
      <ThemeSwitcher />
    </div>
  );
};

export default Index;