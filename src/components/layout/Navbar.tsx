import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, User, LogOut, Settings } from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const userRole = user?.user_metadata?.role || null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-black';
      case 'creator':
        return 'bg-gray-700';
      case 'business':
        return 'bg-gray-800';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">UR</span>
            </div>
            <span className="font-light text-xl text-black">
              URContent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/como-funciona"
              className="text-gray-600 hover:text-black transition-colors font-medium"
            >
              Cómo Funciona
            </Link>
            <Link
              to="/precios"
              className="text-gray-600 hover:text-black transition-colors font-medium"
            >
              Precios
            </Link>
            <Link
              to="/marketplace"
              className="text-gray-600 hover:text-black transition-colors font-medium"
            >
              Creadores
            </Link>
            <Link
              to="/experiences"
              className="text-gray-600 hover:text-black transition-colors font-medium"
            >
              Experiencias
            </Link>

            <div className="flex items-center space-x-3">
              {user ? (
                // Authenticated user menu
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard">
                    <Button variant="ghost" className="text-gray-700 hover:text-black">
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.user_metadata?.avatar_url} />
                          <AvatarFallback className={`${getRoleColor(userRole || 'creator')} text-white font-semibold`}>
                            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-black">
                            {user?.user_metadata?.full_name || 'Usuario'}
                          </p>
                          <p className="text-xs leading-none text-gray-600">
                            {user?.email}
                          </p>
                          {userRole && (
                            <p className="text-xs leading-none text-gray-600 capitalize">
                              {userRole}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                // Unauthenticated user menu
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-black">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/registro">
                    <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded font-medium">
                      Empezar Gratis
                    </Button>
                  </Link>
                </>
              )}
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

              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-gray-600 hover:text-black transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:text-black transition-colors font-medium"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-gray-600 hover:text-black transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="block px-3 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-medium rounded mx-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Empezar Gratis
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};