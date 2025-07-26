import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Store, MapPin, Phone, Globe } from "lucide-react";

const categorias = [
  "Gastronomía", "Belleza y Estética", "Fitness y Deporte", "Moda y Accesorios",
  "Tecnología", "Hogar y Decoración", "Automotriz", "Salud y Bienestar",
  "Entretenimiento", "Educación", "Turismo", "Otros"
];

export default function RegistroComercio() {
  const [formData, setFormData] = useState({
    nombreNegocio: "",
    cuit: "",
    categoria: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    sitioWeb: "",
    instagram: "",
    descripcion: "",
    aceptaTerminos: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registro comercio:", formData);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
              <Store className="w-3 h-3 text-white" />
            </div>
            <span className="font-poppins font-semibold">Registro Comercio</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-elevation">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-poppins">
              Potenciá tu marca con{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                contenido real
              </span>
            </CardTitle>
            <CardDescription className="text-lg">
              Conectate con más de 5,800 creadores de contenido verificados
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Negocio</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreNegocio">Nombre del Negocio *</Label>
                    <Input
                      id="nombreNegocio"
                      placeholder="Ej: Café La Esquina"
                      value={formData.nombreNegocio}
                      onChange={(e) => setFormData({...formData, nombreNegocio: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cuit">CUIT *</Label>
                    <Input
                      id="cuit"
                      placeholder="XX-XXXXXXXX-X"
                      value={formData.cuit}
                      onChange={(e) => setFormData({...formData, cuit: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la categoría de tu negocio" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hola@tunegocio.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="telefono"
                        placeholder="+54 9 11 XXXX-XXXX"
                        className="pl-10"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="direccion"
                        placeholder="Av. Corrientes 1234"
                        className="pl-10"
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      placeholder="Buenos Aires"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Presencia digital */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Presencia Digital</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sitioWeb">Sitio Web</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="sitioWeb"
                        placeholder="www.tunegocio.com"
                        className="pl-10"
                        value={formData.sitioWeb}
                        onChange={(e) => setFormData({...formData, sitioWeb: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@tunegocio"
                      value={formData.instagram}
                      onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Términos */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terminos"
                  checked={formData.aceptaTerminos}
                  onCheckedChange={(checked) => setFormData({...formData, aceptaTerminos: !!checked})}
                />
                <Label htmlFor="terminos" className="text-sm">
                  Acepto los{" "}
                  <Link to="/terminos" className="text-primary hover:underline">
                    Términos de Uso
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacidad" className="text-primary hover:underline">
                    Política de Privacidad
                  </Link>
                </Label>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full btn-gradient text-lg py-3 h-auto"
                disabled={!formData.aceptaTerminos}
              >
                Crear Cuenta Comercio
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Iniciar Sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}