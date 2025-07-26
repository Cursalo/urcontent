import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-poppins font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-muted-foreground mb-4">¡Ups! Página no encontrada</p>
        <a href="/" className="text-primary hover:text-primary/80 underline font-medium">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
