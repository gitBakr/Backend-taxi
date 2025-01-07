import { useState, useEffect } from 'react'
import { useDebounce } from '../hooks/useDebounce'

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
    <form className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Ville de départ"
          value={departQuery}
          onChange={(e) => setDepartQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {loading && <span className="absolute right-2 top-2">Chargement...</span>}
        {suggestions.length > 0 && (
          <ul className="absolute w-full bg-white border rounded mt-1 shadow-lg">
            {suggestions.map((city) => (
              <li
                key={city.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
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

      <input
        type="text"
        placeholder="Ville d'arrivée"
        value={arriveeQuery}
        onChange={(e) => setArriveeQuery(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Rechercher
      </button>
    </form>
  )
} 