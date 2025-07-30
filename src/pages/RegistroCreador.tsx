import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Instagram, Users, TrendingUp } from "lucide-react";

const categorias = [
  "Lifestyle",
  "Gastronomía",
  "Belleza",
  "Fitness",
  "Moda",
  "Tecnología",
  "Viajes",
  "Humor",
  "Educación",
  "Gaming",
  "Arte",
  "Música",
  "Fotografía"
];

export default function RegistroCreador() {
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    telefono: "",
    instagram: "",
    followers: "",
    engagement: "",
    categorias: [] as string[],
    biografia: "",
    aceptaTerminos: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registro creador:", formData);
  };

  const toggleCategoria = (categoria: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter(c => c !== categoria)
        : [...prev.categorias, categoria]
    }));
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
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <Camera className="w-3 h-3 text-white" />
            </div>
            <span className="font-poppins font-semibold">Registro Creador</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-elevation">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-poppins">
              Monetizá tu{" "}
              <span className="text-black font-bold">
                creatividad
              </span>
            </CardTitle>
            <CardDescription className="text-lg">
              Únete a más de 1,250 comercios esperando tu contenido auténtico
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Personal</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      placeholder="Tu nombre real"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre Artístico *</Label>
                    <Input
                      id="username"
                      placeholder="Como te conocen en redes"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      placeholder="+54 9 11 XXXX-XXXX"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Perfil en redes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Perfil en Redes Sociales</h3>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Usuario de Instagram *</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="instagram"
                      placeholder="@tuusuario"
                      className="pl-10"
                      value={formData.instagram}
                      onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verificaremos tu cuenta automáticamente
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followers">Seguidores Aprox.</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Select 
                        value={formData.followers} 
                        onValueChange={(value) => setFormData({...formData, followers: value})}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Cantidad de seguidores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1k-5k">1K - 5K</SelectItem>
                          <SelectItem value="5k-10k">5K - 10K</SelectItem>
                          <SelectItem value="10k-50k">10K - 50K</SelectItem>
                          <SelectItem value="50k-100k">50K - 100K</SelectItem>
                          <SelectItem value="100k+">100K+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engagement">Engagement Rate</Label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Select 
                        value={formData.engagement} 
                        onValueChange={(value) => setFormData({...formData, engagement: value})}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="% de engagement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3">1% - 3%</SelectItem>
                          <SelectItem value="3-6">3% - 6%</SelectItem>
                          <SelectItem value="6-10">6% - 10%</SelectItem>
                          <SelectItem value="10+">10%+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categorías de contenido */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categorías de Contenido</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona hasta 5 categorías que mejor describan tu contenido
                </p>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((categoria) => (
                    <Badge
                      key={categoria}
                      variant={formData.categorias.includes(categoria) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        formData.categorias.includes(categoria)
                          ? "bg-black hover:bg-gray-800 text-white border-black"
                          : "hover:bg-gray-100 border-gray-300"
                      }`}
                      onClick={() => {
                        if (formData.categorias.length < 5 || formData.categorias.includes(categoria)) {
                          toggleCategoria(categoria);
                        }
                      }}
                    >
                      {categoria}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.categorias.length}/5 categorías seleccionadas
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="biografia">Cuéntanos sobre ti</Label>
                <textarea
                  id="biografia"
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Describe tu estilo, experiencia y lo que te hace único como creador..."
                  value={formData.biografia}
                  onChange={(e) => setFormData({...formData, biografia: e.target.value})}
                />
              </div>

              {/* Términos */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terminos"
                  checked={formData.aceptaTerminos}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, aceptaTerminos: !!checked})
                  }
                />
                <Label htmlFor="terminos" className="text-sm">
                  Acepto los{" "}
                  <Link to="/terminos" className="text-black hover:underline font-medium">
                    Términos de Uso
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacidad" className="text-black hover:underline font-medium">
                    Política de Privacidad
                  </Link>
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white text-lg py-3 h-auto transition-colors"
                disabled={!formData.aceptaTerminos}
              >
                Crear Cuenta Creador
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-black hover:underline font-bold">
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