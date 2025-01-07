import { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'

interface City {
  id: number
  nom: string
}

export default function SearchForm() {
  const [departQuery, setDepartQuery] = useState('')
  const [arriveeQuery, setArriveeQuery] = useState('')
  const [suggestions, setSuggestions] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  
  const debouncedDepartQuery = useDebounce(departQuery, 300)

  useEffect(() => {
    const searchCities = async () => {
      if (!debouncedDepartQuery) return
      
      setLoading(true)
      try {
        const response = await fetch(
          `http://localhost:3002/api/villes/search?q=${debouncedDepartQuery}`
        )
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
      } finally {
        setLoading(false)
      }
    }

    searchCities()
  }, [debouncedDepartQuery])

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville de départ
          </label>
          <input
            type="text"
            placeholder="Entrez une ville"
            value={departQuery}
            onChange={(e) => setDepartQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loading && (
            <span className="absolute right-3 top-10 text-gray-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                {/* Spinner SVG */}
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
              {suggestions.map((city) => (
                <li
                  key={city.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setDepartQuery(city.nom)
                    setSuggestions([])
                  }}
                >
                  {city.nom}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville d'arrivée
          </label>
          <input
            type="text"
            placeholder="Entrez une ville"
            value={arriveeQuery}
            onChange={(e) => setArriveeQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Rechercher un taxi
        </button>
      </form>
    </div>
  )
} 