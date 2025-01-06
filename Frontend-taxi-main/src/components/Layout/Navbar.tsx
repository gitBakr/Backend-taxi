import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              TaxiWaaze
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/booking">Réserver</Link>
            <Link to="/profile">Profil</Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 