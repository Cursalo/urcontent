import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  FileText,
  Save,
  Upload,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  Info,
  DollarSign,
  Target,
  Users,
  Calendar,
  Settings
} from 'lucide-react';

const ConfiguracionNegocio: React.FC = () => {
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState('perfil');

  // Estados del formulario
  const [datosNegocio, setDatosNegocio] = useState({
    nombreEmpresa: 'Mi Negocio S.A. de C.V.',
    nombreComercial: 'Mi Negocio',
    rfc: 'MNE123456789',
    giro: 'retail',
    descripcion: 'Somos una empresa líder en el sector retail con presencia en todo México.',
    logo: '/api/placeholder/200/200',
    website: 'www.minegocio.com',
    email: 'contacto@minegocio.com',
    telefono: '+52 55 1234 5678',
    direccion: 'Av. Reforma 123, Col. Centro',
    ciudad: 'Ciudad de México',
    estado: 'CDMX',
    codigoPostal: '06000',
    pais: 'México'
  });

  const [preferencias, setPreferencias] = useState({
    categorias: ['lifestyle', 'tecnologia', 'moda'],
    plataformas: ['instagram', 'tiktok'],
    presupuestoMinimo: 5000,
    presupuestoMaximo: 50000,
    objetivos: ['awareness', 'conversiones'],
    audienciaObjetivo: {
      edadMinima: 18,
      edadMaxima: 45,
      genero: 'todos',
      ubicaciones: ['México', 'Estados Unidos']
    }
  });

  const [notificaciones, setNotificaciones] = useState({
    nuevasPropuestas: true,
    actualizacionesCampana: true,
    mensajesCreators: true,
    reportesSemanales: true,
    alertasPresupuesto: true,
    recordatoriosFechas: true
  });

  const [plantillas, setPlantillas] = useState([
    {
      id: '1',
      nombre: 'Brief Estándar',
      descripcion: 'Plantilla básica para campañas regulares',
      campos: ['objetivos', 'audiencia', 'presupuesto', 'entregables']
    },
    {
      id: '2',
      nombre: 'Lanzamiento de Producto',
      descripcion: 'Para nuevos productos o servicios',
      campos: ['producto', 'características', 'beneficios', 'call-to-action']
    }
  ]);

  // Guardar cambios
  const guardarCambios = async () => {
    setGuardando(true);
    // Simular guardado
    setTimeout(() => {
      setGuardando(false);
      toast.success('Configuración guardada exitosamente');
    }, 1500);
  };

  // Subir logo
  const subirLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Aquí iría la lógica para subir el archivo
      toast.success('Logo actualizado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-gray-900">Configuración del Negocio</h2>
          <p className="text-gray-500 mt-1">Administra la información y preferencias de tu empresa</p>
        </div>
        <Button
          onClick={guardarCambios}
          disabled={guardando}
          className="bg-black hover:bg-gray-800 text-white rounded-full"
        >
          {guardando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>

        {/* Tab Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>
                Datos básicos de tu negocio que serán visibles para los creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="flex items-start space-x-6">
                <div>
                  <Label>Logo de la Empresa</Label>
                  <div className="mt-2 relative group">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={datosNegocio.logo} />
                      <AvatarFallback>
                        <Building2 className="w-16 h-16 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="logo-upload"
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={subirLogo}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG. Max 5MB</p>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreEmpresa">Razón Social</Label>
                    <Input
                      id="nombreEmpresa"
                      value={datosNegocio.nombreEmpresa}
                      onChange={(e) => setDatosNegocio({...datosNegocio, nombreEmpresa: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombreComercial">Nombre Comercial</Label>
                    <Input
                      id="nombreComercial"
                      value={datosNegocio.nombreComercial}
                      onChange={(e) => setDatosNegocio({...datosNegocio, nombreComercial: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      value={datosNegocio.rfc}
                      onChange={(e) => setDatosNegocio({...datosNegocio, rfc: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="giro">Giro del Negocio</Label>
                    <Select value={datosNegocio.giro} onValueChange={(v) => setDatosNegocio({...datosNegocio, giro: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="restaurante">Restaurante</SelectItem>
                        <SelectItem value="servicios">Servicios</SelectItem>
                        <SelectItem value="tecnologia">Tecnología</SelectItem>
                        <SelectItem value="moda">Moda</SelectItem>
                        <SelectItem value="belleza">Belleza</SelectItem>
                        <SelectItem value="salud">Salud</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Negocio</Label>
                <Textarea
                  id="descripcion"
                  value={datosNegocio.descripcion}
                  onChange={(e) => setDatosNegocio({...datosNegocio, descripcion: e.target.value})}
                  rows={3}
                  placeholder="Describe tu negocio, productos o servicios..."
                />
              </div>

              <Separator />

              {/* Información de contacto */}
              <div>
                <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Contacto</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={datosNegocio.email}
                        onChange={(e) => setDatosNegocio({...datosNegocio, email: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="telefono"
                        value={datosNegocio.telefono}
                        onChange={(e) => setDatosNegocio({...datosNegocio, telefono: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="website"
                        value={datosNegocio.website}
                        onChange={(e) => setDatosNegocio({...datosNegocio, website: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dirección */}
              <div>
                <h3 className="text-lg font-medium mb-4">Dirección</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="direccion"
                        value={datosNegocio.direccion}
                        onChange={(e) => setDatosNegocio({...datosNegocio, direccion: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={datosNegocio.ciudad}
                      onChange={(e) => setDatosNegocio({...datosNegocio, ciudad: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={datosNegocio.estado}
                      onChange={(e) => setDatosNegocio({...datosNegocio, estado: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigoPostal">Código Postal</Label>
                    <Input
                      id="codigoPostal"
                      value={datosNegocio.codigoPostal}
                      onChange={(e) => setDatosNegocio({...datosNegocio, codigoPostal: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pais">País</Label>
                    <Input
                      id="pais"
                      value={datosNegocio.pais}
                      onChange={(e) => setDatosNegocio({...datosNegocio, pais: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Preferencias */}
        <TabsContent value="preferencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Colaboración</CardTitle>
              <CardDescription>
                Define tus criterios para trabajar con creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categorías */}
              <div className="space-y-3">
                <Label>Categorías de Interés</Label>
                <div className="flex flex-wrap gap-2">
                  {['lifestyle', 'moda', 'belleza', 'fitness', 'tecnologia', 'gastronomia', 'viajes', 'educacion'].map((categoria) => (
                    <Badge
                      key={categoria}
                      variant={preferencias.categorias.includes(categoria) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        if (preferencias.categorias.includes(categoria)) {
                          setPreferencias({
                            ...preferencias,
                            categorias: preferencias.categorias.filter(c => c !== categoria)
                          });
                        } else {
                          setPreferencias({
                            ...preferencias,
                            categorias: [...preferencias.categorias, categoria]
                          });
                        }
                      }}
                    >
                      {categoria}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Plataformas */}
              <div className="space-y-3">
                <Label>Plataformas Preferidas</Label>
                <div className="flex flex-wrap gap-2">
                  {['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin'].map((plataforma) => (
                    <Badge
                      key={plataforma}
                      variant={preferencias.plataformas.includes(plataforma) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        if (preferencias.plataformas.includes(plataforma)) {
                          setPreferencias({
                            ...preferencias,
                            plataformas: preferencias.plataformas.filter(p => p !== plataforma)
                          });
                        } else {
                          setPreferencias({
                            ...preferencias,
                            plataformas: [...preferencias.plataformas, plataforma]
                          });
                        }
                      }}
                    >
                      {plataforma}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Presupuesto */}
              <div>
                <h3 className="text-lg font-medium mb-4">Rango de Presupuesto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="presupuestoMinimo">Presupuesto Mínimo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="presupuestoMinimo"
                        type="number"
                        value={preferencias.presupuestoMinimo}
                        onChange={(e) => setPreferencias({...preferencias, presupuestoMinimo: parseInt(e.target.value)})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="presupuestoMaximo">Presupuesto Máximo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="presupuestoMaximo"
                        type="number"
                        value={preferencias.presupuestoMaximo}
                        onChange={(e) => setPreferencias({...preferencias, presupuestoMaximo: parseInt(e.target.value)})}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Audiencia objetivo */}
              <div>
                <h3 className="text-lg font-medium mb-4">Audiencia Objetivo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rango de Edad</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={preferencias.audienciaObjetivo.edadMinima}
                        onChange={(e) => setPreferencias({
                          ...preferencias,
                          audienciaObjetivo: {
                            ...preferencias.audienciaObjetivo,
                            edadMinima: parseInt(e.target.value)
                          }
                        })}
                        className="w-20"
                      />
                      <span className="text-gray-500">a</span>
                      <Input
                        type="number"
                        value={preferencias.audienciaObjetivo.edadMaxima}
                        onChange={(e) => setPreferencias({
                          ...preferencias,
                          audienciaObjetivo: {
                            ...preferencias.audienciaObjetivo,
                            edadMaxima: parseInt(e.target.value)
                          }
                        })}
                        className="w-20"
                      />
                      <span className="text-gray-500">años</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Género</Label>
                    <Select 
                      value={preferencias.audienciaObjetivo.genero}
                      onValueChange={(v) => setPreferencias({
                        ...preferencias,
                        audienciaObjetivo: {
                          ...preferencias.audienciaObjetivo,
                          genero: v
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="mujeres">Mujeres</SelectItem>
                        <SelectItem value="hombres">Hombres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Pagos */}
        <TabsContent value="pagos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>
                Administra tus métodos de pago para campañas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expira 12/25</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Principal
                  </Badge>
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Método de Pago
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información Fiscal</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Razón Social:</span>
                    <span className="text-sm font-medium">{datosNegocio.nombreEmpresa}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">RFC:</span>
                    <span className="text-sm font-medium">{datosNegocio.rfc}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Dirección Fiscal:</span>
                    <span className="text-sm font-medium">{datosNegocio.direccion}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                Últimas transacciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { fecha: '15 Jun 2024', concepto: 'Campaña Verano - María García', monto: 8500, estado: 'completado' },
                  { fecha: '10 Jun 2024', concepto: 'Campaña Día del Padre - Carlos López', monto: 6500, estado: 'completado' },
                  { fecha: '05 Jun 2024', concepto: 'Campaña Mayo - Ana Martínez', monto: 5500, estado: 'pendiente' }
                ].map((pago, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{pago.concepto}</p>
                      <p className="text-xs text-gray-500">{pago.fecha}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN'
                        }).format(pago.monto)}
                      </p>
                      <Badge variant={pago.estado === 'completado' ? 'default' : 'secondary'}>
                        {pago.estado === 'completado' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Plantillas */}
        <TabsContent value="plantillas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Campaña</CardTitle>
              <CardDescription>
                Crea plantillas reutilizables para tus briefings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plantillas.map((plantilla) => (
                  <div key={plantilla.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{plantilla.nombre}</h4>
                        <p className="text-sm text-gray-500 mt-1">{plantilla.descripcion}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {plantilla.campos.map((campo) => (
                            <Badge key={campo} variant="outline" className="text-xs">
                              {campo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Nueva Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Notificaciones */}
        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
              <CardDescription>
                Controla cómo y cuándo recibes notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(notificaciones).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={key} className="text-base font-normal">
                        {key === 'nuevasPropuestas' && 'Nuevas Propuestas'}
                        {key === 'actualizacionesCampana' && 'Actualizaciones de Campaña'}
                        {key === 'mensajesCreators' && 'Mensajes de Creators'}
                        {key === 'reportesSemanales' && 'Reportes Semanales'}
                        {key === 'alertasPresupuesto' && 'Alertas de Presupuesto'}
                        {key === 'recordatoriosFechas' && 'Recordatorios de Fechas'}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {key === 'nuevasPropuestas' && 'Recibe alertas cuando lleguen nuevas propuestas'}
                        {key === 'actualizacionesCampana' && 'Notificaciones sobre el progreso de tus campañas'}
                        {key === 'mensajesCreators' && 'Alertas de nuevos mensajes de creators'}
                        {key === 'reportesSemanales' && 'Resumen semanal de tu actividad'}
                        {key === 'alertasPresupuesto' && 'Avisos cuando se acerque al límite de presupuesto'}
                        {key === 'recordatoriosFechas' && 'Recordatorios de fechas importantes'}
                      </p>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setNotificaciones({...notificaciones, [key]: checked})}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Canales de Notificación</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-500">{datosNegocio.email}</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Notificaciones Push</p>
                        <p className="text-sm text-gray-500">En la aplicación web</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">SMS</p>
                        <p className="text-sm text-gray-500">{datosNegocio.telefono}</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracionNegocio;