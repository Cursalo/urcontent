import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UR</span>
            </div>
            <span className="font-light text-xl text-black">
              URContent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/como-funciona" className="text-gray-600 hover:text-black transition-colors font-medium">
              Cómo Funciona
            </Link>
            <Link to="/precios" className="text-gray-600 hover:text-black transition-colors font-medium">
              Precios
            </Link>
            <Link to="/marketplace" className="text-gray-600 hover:text-black transition-colors font-medium">
              Creadores
            </Link>
            <Link to="/experiences" className="text-gray-600 hover:text-black transition-colors font-medium">
              Experiencias
            </Link>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-black">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/registro">
                <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium">
                  Empezar Gratis
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <Link
                to="/como-funciona"
                className="block px-3 py-2 text-gray-600 hover:text-black transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Cómo Funciona
              </Link>
              <Link
                to="/precios"
                className="block px-3 py-2 text-gray-600 hover:text-black transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Precios
              </Link>
              <Link
                to="/marketplace"
                className="block px-3 py-2 text-gray-600 hover:text-black transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Creadores
              </Link>
              <Link
                to="/experiences"
                className="block px-3 py-2 text-gray-600 hover:text-black transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Experiencias
              </Link>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100 mt-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/registro" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-full font-medium">
                    Empezar Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};