import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { villeAPI, prixAPI } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface City {
  _id: string;
  nom: string;
  gouvernorat: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface BookingFormProps {
  onSearchComplete: (result: {
    price: number;
    duration: string;
    distance: string;
  }) => void;
}

interface EstimationResponse {
  status: string;
  data: {
    prixBase: number;
    fraisService: number;
    total: number;
    detail: {
      distance: number;
      duree: number;
      majorations: {
        climatisation?: number;
        nuit?: number;
      };
      options: {
        passagers: number;
        climatisation: boolean;
        date: string;
      };
      trajet: {
        depart: string;
        arrivee: string;
        coordinates: {
          depart: [number, number];
          arrivee: [number, number];
        };
      };
    };
  };
}

export const BookingForm = ({ onSearchComplete }: BookingFormProps) => {
  const [departQuery, setDepartQuery] = useState('');
  const [arriveeQuery, setArriveeQuery] = useState('');
  const [departSuggestions, setDepartSuggestions] = useState<City[]>([]);
  const [arriveeSuggestions, setArriveeSuggestions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [estimation, setEstimation] = useState<{
    prixBase: number;
    fraisService: number;
    total: number;
    detail: {
      distance: number;
      duree: number;
      majorations: {
        climatisation?: number;
        nuit?: number;
      };
    };
  } | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDepartCity, setSelectedDepartCity] = useState<City | null>(null);
  const [selectedArriveeCity, setSelectedArriveeCity] = useState<City | null>(null);
  const [currentStep, setCurrentStep] = useState<'depart' | 'arrivee' | 'choixType' | 'details' | 'estimation'>('depart');
  const [isQuickEstimate, setIsQuickEstimate] = useState(false);
  const [reservationType, setReservationType] = useState<'immediate' | 'scheduled'>('immediate');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchingDriver, setSearchingDriver] = useState(false);
  const [searchStep, setSearchStep] = useState<number>(0);

  const debouncedDepartQuery = useDebounce(departQuery, 300);
  const debouncedArriveeQuery = useDebounce(arriveeQuery, 300);

  const searchMessages = [
    "Recherche des chauffeurs disponibles...",
    "Vérification des disponibilités...",
    "Calcul de l'itinéraire optimal...",
    "Confirmation du trajet..."
  ];

  // Recherche des villes pour le départ
  useEffect(() => {
    const searchCities = async () => {
      if (!debouncedDepartQuery) return;
      
      setLoading(true);
      try {
        const response = await villeAPI.search(debouncedDepartQuery);
        if (response.data.status === "success") {
          setDepartSuggestions(response.data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setLoading(false);
      }
    };

    searchCities();
  }, [debouncedDepartQuery]);

  // Recherche des villes pour l'arrivée
  useEffect(() => {
    const searchCities = async () => {
      if (!debouncedArriveeQuery) return;
      
      try {
        const response = await villeAPI.search(debouncedArriveeQuery);
        if (response.data.status === "success") {
          setArriveeSuggestions(response.data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      }
    };

    searchCities();
  }, [debouncedArriveeQuery]);

  // Estimation instantanée quand une ville est sélectionnée
  const estimatePrix = async (selectedCity: City) => {
    if (!selectedDepartCity || !selectedCity) {
      console.warn('❌ Villes manquantes:', { 
        depart: selectedDepartCity?.nom, 
        arrivee: selectedCity?.nom 
      });
      return;
    }

    console.log('📍 Début estimation avec:', {
      depart: selectedDepartCity.nom,
      arrivee: selectedCity.nom,
      coordinates: {
        depart: selectedDepartCity.coordinates,
        arrivee: selectedCity.coordinates
      }
    });

    try {
      // Validation des coordonnées
      if (!selectedDepartCity.coordinates || !selectedCity.coordinates) {
        throw new Error('Coordonnées manquantes pour une des villes');
      }

      const params = {
        depart: {
          nom: selectedDepartCity.nom,
          coordinates: selectedDepartCity.coordinates
        },
        arrivee: {
          nom: selectedCity.nom,
          coordinates: selectedCity.coordinates
        },
        passagers: passengers,
        date: date,
        options: ['climatisation']
      };

      console.log('🚗 Envoi requête prix:', {
        ...params,
        date: new Date(date).toLocaleDateString('fr-FR') // Format lisible de la date
      });

      const response = await prixAPI.calculerPrix(params);
      console.log('📦 Réponse API:', response.data);

      if (response.data.status === "success") {
        const estimationData = response.data.data.data;
        console.log('🔍 Données reçues:', estimationData);

        // Vérification et formatage des données
        const formattedEstimation = {
          prixBase: Number(estimationData.prixBase),
          fraisService: Number(estimationData.fraisService),
          total: Number(estimationData.total),
          detail: {
            distance: Number(estimationData.detail.distance),
            duree: Number(estimationData.detail.duree),
            majorations: estimationData.detail.majorations
          }
        };

        console.log('✅ Estimation formatée:', formattedEstimation);
        setEstimation(formattedEstimation);
      }
    } catch (error: any) {
      console.error('❌ Erreur estimation:', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowDialog(true);
  };

  // Valeurs par défaut
  const defaultValues = {
    date: new Date().toISOString().split('T')[0],
    passengers: 1
  };

  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    switch (currentStep) {
      case 'depart':
        if (selectedDepartCity) {
          setCurrentStep('arrivee');
        }
        break;
      case 'arrivee':
        if (selectedArriveeCity) {
          setCurrentStep('choixType');
        }
        break;
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Estimation de trajet</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Étape 1: Ville de départ */}
        <div className="space-y-2">
          <Label>Ville de départ</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="departure" 
              className="pl-10" 
              placeholder="D'où partez-vous ?"
              value={departQuery}
              onChange={(e) => setDepartQuery(e.target.value)}
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {departSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                {departSuggestions.map((city) => (
                  <li
                    key={city._id}
                    className="p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      console.log('🏁 Sélection ville départ:', city);
                      setDepartQuery(city.nom);
                      setSelectedDepartCity(city);
                      setDepartSuggestions([]);
                    }}
                  >
                    {city.nom}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Étape 2: Ville d'arrivée */}
        {currentStep !== 'depart' && (
          <div className="space-y-2 animate-fade-in">
            <Label>Ville d'arrivée</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="arrival" 
                className="pl-10" 
                placeholder="Où allez-vous ?"
                value={arriveeQuery}
                onChange={(e) => setArriveeQuery(e.target.value)}
              />
              {arriveeSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                  {arriveeSuggestions.map((city) => (
                    <li
                      key={city._id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        console.log('🎯 Sélection ville arrivée:', city);
                        setArriveeQuery(city.nom);
                        setSelectedArriveeCity(city);
                        setArriveeSuggestions([]);
                        
                        // Vérifier que nous avons bien la ville de départ
                        if (selectedDepartCity) {
                          console.log('🚗 Calcul estimation avec:', {
                            depart: selectedDepartCity.nom,
                            arrivee: city.nom
                          });
                          estimatePrix(city);
                        } else {
                          console.warn('⚠️ Ville de départ non sélectionnée');
                        }
                      }}
                    >
                      {city.nom}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Étape 3: Affichage de l'estimation */}
        {estimation && (currentStep === 'estimation' || currentStep === 'reservation') && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fade-in">
            <h4 className="font-medium text-gray-900">Estimation</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>Prix de base : {Number(estimation.prixBase).toFixed(2)} DT</p>
              <p>Frais de service : {Number(estimation.fraisService).toFixed(2)} DT</p>
              
              {Object.entries(estimation.detail.majorations || {}).map(([type, value]) => (
                <p key={type}>
                  Majoration {type} : +{((Number(value) - 1) * 100).toFixed(0)}%
                </p>
              ))}

              <div className="border-t border-gray-200 my-2 pt-2">
                <p>Distance : {Number(estimation.detail.distance).toFixed(1)} km</p>
                <p>Durée estimée : {Math.round(estimation.detail.duree)} min</p>
        </div>

              <p className="text-lg font-semibold text-primary mt-2">
                Total : {Number(estimation.total).toFixed(2)} DT
              </p>
            </div>
          </div>
        )}

        {/* Étape 4: Champs de réservation */}
        {currentStep === 'reservation' && (
          <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date) => {
                      setSelectedDate(date);
                      setDate(date.toISOString().split('T')[0]);
                      if (selectedDepartCity && selectedArriveeCity) {
                        estimatePrix(selectedArriveeCity);
                      }
                    }}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-10 h-10 rounded-md border border-input bg-background"
                    placeholderText="Sélectionnez une date"
                    showPopperArrow={false}
                    customInput={
                      <input
                        className="w-full pl-10 h-10 rounded-md border border-input bg-background"
                      />
                    }
                  />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengers">Passagers</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select 
                    id="passengers"
                    className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background"
                    value={passengers}
                    onChange={(e) => {
                      setPassengers(Number(e.target.value));
                      if (selectedDepartCity && selectedArriveeCity) {
                        estimatePrix(selectedArriveeCity);
                      }
                    }}
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "passager" : "passagers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'choixType' && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="font-medium text-gray-600">Quand souhaitez-vous partir ?</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDate(new Date().toISOString().split('T')[0]);
                  setPassengers(1);
                  setCurrentStep('estimation');
                  if (selectedArriveeCity) {
                    estimatePrix(selectedArriveeCity);
                  }
                }}
              >
                <Clock className="mr-2 h-4 w-4" />
                Tout de suite
              </Button>

              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrentStep('details');
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Réserver
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'details' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date) => {
                      setSelectedDate(date);
                      setDate(date.toISOString().split('T')[0]);
                      if (selectedDepartCity && selectedArriveeCity) {
                        estimatePrix(selectedArriveeCity);
                      }
                    }}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-10 h-10 rounded-md border border-input bg-background"
                    placeholderText="Sélectionnez une date"
                    showPopperArrow={false}
                    customInput={
                      <input
                        className="w-full pl-10 h-10 rounded-md border border-input bg-background"
                      />
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers">Passagers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select 
                    id="passengers"
                    className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background"
                    value={passengers}
                    onChange={(e) => {
                      setPassengers(Number(e.target.value));
                      if (selectedDepartCity && selectedArriveeCity) {
                        estimatePrix(selectedArriveeCity);
                      }
                    }}
                  >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "passager" : "passagers"}
                  </option>
                ))}
              </select>
            </div>
          </div>
            </div>
            <Button 
              type="button"
              className="w-full"
              onClick={() => {
                setCurrentStep('estimation');
                if (selectedArriveeCity) {
                  estimatePrix(selectedArriveeCity);
                }
              }}
            >
              Voir l'estimation
            </Button>
          </div>
        )}

        {currentStep === 'estimation' && estimation && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fade-in">
            <h4 className="font-medium text-gray-900">Estimation</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>Prix de base : {Number(estimation.prixBase).toFixed(2)} DT</p>
              <p>Frais de service : {Number(estimation.fraisService).toFixed(2)} DT</p>
              
              {Object.entries(estimation.detail.majorations || {}).map(([type, value]) => (
                <p key={type}>
                  Majoration {type} : +{((Number(value) - 1) * 100).toFixed(0)}%
                </p>
              ))}

              <div className="border-t border-gray-200 my-2 pt-2">
                <p>Distance : {Number(estimation.detail.distance).toFixed(1)} km</p>
                <p>Durée estimée : {Math.round(estimation.detail.duree)} min</p>
        </div>

              <p className="text-lg font-semibold text-primary mt-2">
                Total : {Number(estimation.total).toFixed(2)} DT
              </p>
            </div>

            <Button 
              type="submit"
              className={`w-full mt-4 ${
                searchingDriver 
                  ? 'bg-blue-900 hover:bg-blue-800' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={searchingDriver}
              onClick={() => {
                setSearchingDriver(true);
                let step = 0;
                const interval = setInterval(() => {
                  if (step < searchMessages.length - 1) {
                    step++;
                    setSearchStep(step);
                  } else {
                    clearInterval(interval);
                    setTimeout(() => {
                      setSearchingDriver(false);
                      setShowDialog(true);
                    }, 2000);
                  }
                }, 1500);
              }}
            >
              {searchingDriver ? (
                <div className="space-y-4 py-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg w-full">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin h-12 w-12 border-4 border-teal-400 border-t-transparent rounded-full shadow-lg shadow-teal-500/20" />
                    <span className="text-xl font-semibold text-white text-center px-4">
                      {searchMessages[searchStep]}
                    </span>
                  </div>
                  <div className="text-base font-medium text-teal-200 mt-4 text-center">
                    <span className="text-white">{selectedDepartCity?.nom}</span>
                    <span className="mx-2 text-teal-400">→</span>
                    <span className="text-white">{selectedArriveeCity?.nom}</span>
                  </div>
                  <div className="flex justify-center items-center px-4 mt-2">
                    <div className="text-sm text-teal-100 font-medium text-center w-full max-w-[250px] leading-relaxed space-y-1">
                      <p>Veuillez patienter</p>
                      <p>pendant que nous recherchons</p>
                      <p className="text-teal-300">le meilleur chauffeur disponible</p>
                    </div>
                  </div>
                </div>
              ) : (
                'Confirmer la réservation'
              )}
            </Button>
          </div>
        )}

        {currentStep !== 'estimation' && (
          <Button 
            type="button"
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={goToNextStep}
          >
            Continuer
          </Button>
        )}
      </form>
    </div>
  );
};