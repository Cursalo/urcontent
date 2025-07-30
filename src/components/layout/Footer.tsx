import { Link } from "react-router-dom";
import { Instagram, Linkedin, Twitter, Mail, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <span className="font-bold text-black text-lg">UR</span>
              </div>
              <span className="font-light text-2xl text-white">
                URContent
              </span>
            </Link>
            <p className="text-white/70 mb-8 leading-relaxed font-light">
              La plataforma que conecta marcas con creadores de contenido en Argentina.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:hola@urcontent.app"
                className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-medium text-white mb-6">Plataforma</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/marketplace"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Explorar Creadores
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Experiencias
                </Link>
              </li>
              <li>
                <Link
                  to="/como-funciona"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link
                  to="/precios"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  to="/api"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  API Developers
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-medium text-white mb-6">Recursos</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/blog"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/guias"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Guías
                </Link>
              </li>
              <li>
                <Link
                  to="/casos-exito"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Casos de Éxito
                </Link>
              </li>
              <li>
                <Link
                  to="/soporte"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Centro de Ayuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/terminos"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidad"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/contacto"
                  className="text-white/70 hover:text-white transition-colors font-light"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm font-light">
            © 2024 URContent. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-sm text-white/70 font-light">Hecho con</span>
            <Heart className="w-4 h-4 text-gray-500 fill-red-500" />
            <span className="text-sm text-white/70 font-light">en Argentina</span>
          </div>
        </div>
      </div>
    </footer>
  );
};