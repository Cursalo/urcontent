import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Handshake,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageCircle,
  FileText,
  DollarSign,
  Calendar,
  User,
  Store,
  Camera,
  TrendingUp,
  Shield,
  Ban,
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Flag,
  Image,
  Video,
  Link,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Colaboracion {
  id: string;
  titulo: string;
  creador: {
    nombre: string;
    email: string;
    avatar: string;
    rating: number;
    verificado: boolean;
  };
  negocio: {
    nombre: string;
    email: string;
    avatar: string;
    industria: string;
    verificado: boolean;
  };
  estado: 'activa' | 'completada' | 'pendiente' | 'disputada' | 'cancelada' | 'en_revision';
  categoria: string;
  presupuesto: number;
  comision: number;
  fechaInicio: Date;
  fechaFin?: Date;
  progreso: number;
  entregables: {
    tipo: 'imagen' | 'video' | 'story' | 'post';
    cantidad: number;
    completados: number;
  }[];
  metricas?: {
    alcance: number;
    engagement: number;
    clicks: number;
    conversiones: number;
  };
  mensajesCount: number;
  ultimaActividad: Date;
  reportes: number;
  calificacionCreador?: number;
  calificacionNegocio?: number;
}

export const GestionColaboracionesAdmin = () => {
  const [colaboraciones] = useState<Colaboracion[]>([
    {
      id: 'COL-001',
      titulo: 'Campaña de Verano - Café Central',
      creador: {
        nombre: 'María García',
        email: 'maria@example.com',
        avatar: 'MG',
        rating: 4.9,
        verificado: true,
      },
      negocio: {
        nombre: 'Café Central',
        email: 'info@cafecentral.com',
        avatar: 'CC',
        industria: 'Restaurantes',
        verificado: true,
      },
      estado: 'activa',
      categoria: 'Food & Beverage',
      presupuesto: 15000,
      comision: 2250,
      fechaInicio: new Date('2024-07-15'),
      progreso: 65,
      entregables: [
        { tipo: 'imagen', cantidad: 5, completados: 3 },
        { tipo: 'video', cantidad: 2, completados: 1 },
        { tipo: 'story', cantidad: 10, completados: 7 },
      ],
      metricas: {
        alcance: 145000,
        engagement: 8.5,
        clicks: 3200,
        conversiones: 124,
      },
      mensajesCount: 23,
      ultimaActividad: new Date(),
      reportes: 0,
    },
    {
      id: 'COL-002',
      titulo: 'Lanzamiento Nueva Colección Fitness',
      creador: {
        nombre: 'Carlos Tech',
        email: 'carlos@tech.com',
        avatar: 'CT',
        rating: 4.8,
        verificado: true,
      },
      negocio: {
        nombre: 'FitnessPro',
        email: 'contact@fitnesspro.com',
        avatar: 'FP',
        industria: 'Deportes',
        verificado: false,
      },
      estado: 'disputada',
      categoria: 'Fitness',
      presupuesto: 25000,
      comision: 3750,
      fechaInicio: new Date('2024-07-01'),
      fechaFin: new Date('2024-07-25'),
      progreso: 90,
      entregables: [
        { tipo: 'imagen', cantidad: 8, completados: 8 },
        { tipo: 'video', cantidad: 3, completados: 2 },
        { tipo: 'post', cantidad: 5, completados: 5 },
      ],
      mensajesCount: 45,
      ultimaActividad: new Date('2024-07-26'),
      reportes: 2,
    },
    {
      id: 'COL-003',
      titulo: 'Review Productos Tech Store',
      creador: {
        nombre: 'Laura Fashion',
        email: 'laura@fashion.com',
        avatar: 'LF',
        rating: 4.7,
        verificado: true,
      },
      negocio: {
        nombre: 'TechStore',
        email: 'hello@techstore.com',
        avatar: 'TS',
        industria: 'Tecnología',
        verificado: true,
      },
      estado: 'completada',
      categoria: 'Tecnología',
      presupuesto: 8500,
      comision: 1275,
      fechaInicio: new Date('2024-06-15'),
      fechaFin: new Date('2024-07-15'),
      progreso: 100,
      entregables: [
        { tipo: 'video', cantidad: 1, completados: 1 },
        { tipo: 'imagen', cantidad: 10, completados: 10 },
        { tipo: 'story', cantidad: 5, completados: 5 },
      ],
      metricas: {
        alcance: 89000,
        engagement: 6.2,
        clicks: 1800,
        conversiones: 67,
      },
      mensajesCount: 18,
      ultimaActividad: new Date('2024-07-15'),
      reportes: 0,
      calificacionCreador: 5,
      calificacionNegocio: 4.8,
    },
  ]);

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [colaboracionSeleccionada, setColaboracionSeleccionada] = useState<Colaboracion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalAccion, setModalAccion] = useState<'ver' | 'moderar' | 'disputa' | null>(null);

  // Estadísticas
  const estadisticas = {
    total: colaboraciones.length,
    activas: colaboraciones.filter(c => c.estado === 'activa').length,
    completadas: colaboraciones.filter(c => c.estado === 'completada').length,
    disputadas: colaboraciones.filter(c => c.estado === 'disputada').length,
    valorTotal: colaboraciones.reduce((sum, c) => sum + c.presupuesto, 0),
    comisionTotal: colaboraciones.reduce((sum, c) => sum + c.comision, 0),
  };

  // Filtrar colaboraciones
  const colaboracionesFiltradas = colaboraciones.filter(colab => {
    const coincideBusqueda = colab.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            colab.creador.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            colab.negocio.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || colab.estado === filtroEstado;
    const coincideCategoria = filtroCategoria === 'todas' || colab.categoria === filtroCategoria;
    return coincideBusqueda && coincideEstado && coincideCategoria;
  });

  const getColorEstado = (estado: string) => {
    const colores = {
      activa: 'bg-green-100 text-green-800 border-green-200',
      completada: 'bg-blue-100 text-blue-800 border-blue-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      disputada: 'bg-red-100 text-red-800 border-red-200',
      cancelada: 'bg-gray-100 text-gray-800 border-gray-200',
      en_revision: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colores[estado as keyof typeof colores] || colores.pendiente;
  };

  const getIconoEstado = (estado: string) => {
    const iconos = {
      activa: <Play className="w-4 h-4" />,
      completada: <CheckCircle className="w-4 h-4" />,
      pendiente: <Clock className="w-4 h-4" />,
      disputada: <AlertTriangle className="w-4 h-4" />,
      cancelada: <X className="w-4 h-4" />,
      en_revision: <Eye className="w-4 h-4" />,
    };
    return iconos[estado as keyof typeof iconos] || iconos.pendiente;
  };

  const handleAccion = (accion: string, colaboracion: Colaboracion) => {
    setColaboracionSeleccionada(colaboracion);
    setModalAccion(accion as any);
    setModalAbierto(true);
  };

  const calcularProgresoTotal = (entregables: Colaboracion['entregables']) => {
    const total = entregables.reduce((sum, e) => sum + e.cantidad, 0);
    const completados = entregables.reduce((sum, e) => sum + e.completados, 0);
    return total > 0 ? (completados / total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-gray-500">Colaboraciones</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-600">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{estadisticas.activas}</div>
            <p className="text-xs text-gray-500">En progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-600">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{estadisticas.completadas}</div>
            <p className="text-xs text-gray-500">Finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-600">Disputadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{estadisticas.disputadas}</div>
            <p className="text-xs text-gray-500">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.valorTotal.toLocaleString('es-MX')}</div>
            <p className="text-xs text-gray-500">MXN en colaboraciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-600">Comisiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${estadisticas.comisionTotal.toLocaleString('es-MX')}</div>
            <p className="text-xs text-gray-500">MXN generados</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {estadisticas.disputadas > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Disputas Pendientes</h4>
              <p className="text-sm text-red-700 mt-1">
                Hay {estadisticas.disputadas} colaboraciones con disputas que requieren moderación inmediata.
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
              Ver Disputas
            </Button>
          </div>
        </div>
      )}

      {/* Tabla de Colaboraciones */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="text-xl">Gestión de Colaboraciones</CardTitle>
              <CardDescription>Supervisa y modera todas las colaboraciones de la plataforma</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reportes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por título, creador o negocio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activa">Activas</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="disputada">Disputadas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
                <SelectItem value="en_revision">En revisión</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Tecnología">Tecnología</SelectItem>
                <SelectItem value="Moda">Moda</SelectItem>
                <SelectItem value="Belleza">Belleza</SelectItem>
                <SelectItem value="Viajes">Viajes</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Colaboración</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Actividad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboracionesFiltradas.map((colab) => (
                  <TableRow key={colab.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">{colab.id}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{colab.titulo}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="secondary" className="text-xs">{colab.categoria}</Badge>
                          {colab.reportes > 0 && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <Flag className="w-3 h-3" />
                              <span className="text-xs">{colab.reportes} reportes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{colab.creador.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-1">
                              <p className="text-sm font-medium">{colab.creador.nombre}</p>
                              {colab.creador.verificado && <CheckCircle className="w-3 h-3 text-green-500" />}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Camera className="w-3 h-3" />
                              <span>Creador • ⭐ {colab.creador.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{colab.negocio.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-1">
                              <p className="text-sm font-medium">{colab.negocio.nombre}</p>
                              {colab.negocio.verificado && <CheckCircle className="w-3 h-3 text-green-500" />}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Store className="w-3 h-3" />
                              <span>{colab.negocio.industria}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getColorEstado(colab.estado)}>
                        <span className="flex items-center space-x-1">
                          {getIconoEstado(colab.estado)}
                          <span>{colab.estado}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Progress value={colab.progreso} className="w-24 h-2" />
                        <div className="text-xs text-gray-500">
                          {colab.progreso}% completado
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">${colab.presupuesto.toLocaleString('es-MX')}</p>
                        <p className="text-xs text-gray-500">
                          Comisión: ${colab.comision.toLocaleString('es-MX')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{format(colab.fechaInicio, 'dd/MM', { locale: es })}</span>
                          {colab.fechaFin && (
                            <>
                              <span>-</span>
                              <span>{format(colab.fechaFin, 'dd/MM', { locale: es })}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MessageCircle className="w-3 h-3" />
                          <span>{colab.mensajesCount} mensajes</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAccion('ver', colab)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAccion('moderar', colab)}>
                            <Shield className="w-4 h-4 mr-2" />
                            Moderar contenido
                          </DropdownMenuItem>
                          {colab.estado === 'disputada' && (
                            <DropdownMenuItem 
                              onClick={() => handleAccion('disputa', colab)}
                              className="text-red-600"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Resolver disputa
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar colaboración
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Cancelar colaboración
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-gray-500">
              Mostrando {colaboracionesFiltradas.length} de {colaboraciones.length} colaboraciones
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">Página 1 de 1</span>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {colaboracionSeleccionada && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {modalAccion === 'ver' && 'Detalles de la Colaboración'}
                  {modalAccion === 'moderar' && 'Moderación de Contenido'}
                  {modalAccion === 'disputa' && 'Resolución de Disputa'}
                </DialogTitle>
                <DialogDescription>
                  {colaboracionSeleccionada.titulo} • {colaboracionSeleccionada.id}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                {modalAccion === 'ver' && (
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="entregables">Entregables</TabsTrigger>
                      <TabsTrigger value="metricas">Métricas</TabsTrigger>
                      <TabsTrigger value="comunicacion">Comunicación</TabsTrigger>
                      <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Información del Creador */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center space-x-2">
                              <Camera className="w-4 h-4" />
                              <span>Creador</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback>{colaboracionSeleccionada.creador.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{colaboracionSeleccionada.creador.nombre}</p>
                                  {colaboracionSeleccionada.creador.verificado && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{colaboracionSeleccionada.creador.email}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{colaboracionSeleccionada.creador.rating}</span>
                                  </div>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-sm text-gray-500">23 colaboraciones</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Información del Negocio */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center space-x-2">
                              <Store className="w-4 h-4" />
                              <span>Negocio</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-start space-x-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback>{colaboracionSeleccionada.negocio.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{colaboracionSeleccionada.negocio.nombre}</p>
                                  {colaboracionSeleccionada.negocio.verificado && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{colaboracionSeleccionada.negocio.email}</p>
                                <div className="mt-2">
                                  <Badge variant="secondary">{colaboracionSeleccionada.negocio.industria}</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detalles de la Colaboración */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Información de la Colaboración</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-xs text-gray-500">Estado</Label>
                              <Badge variant="outline" className={`mt-1 ${getColorEstado(colaboracionSeleccionada.estado)}`}>
                                {colaboracionSeleccionada.estado}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Categoría</Label>
                              <p className="mt-1">{colaboracionSeleccionada.categoria}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Presupuesto</Label>
                              <p className="mt-1 font-medium">${colaboracionSeleccionada.presupuesto.toLocaleString('es-MX')} MXN</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Comisión Plataforma</Label>
                              <p className="mt-1 text-purple-600">${colaboracionSeleccionada.comision.toLocaleString('es-MX')} MXN</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Fecha de Inicio</Label>
                              <p className="mt-1">{format(colaboracionSeleccionada.fechaInicio, 'dd/MM/yyyy', { locale: es })}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Fecha de Fin</Label>
                              <p className="mt-1">
                                {colaboracionSeleccionada.fechaFin 
                                  ? format(colaboracionSeleccionada.fechaFin, 'dd/MM/yyyy', { locale: es })
                                  : 'En progreso'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Progreso General</Label>
                              <div className="mt-1">
                                <Progress value={colaboracionSeleccionada.progreso} className="w-full h-2" />
                                <span className="text-xs text-gray-500">{colaboracionSeleccionada.progreso}%</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Última Actividad</Label>
                              <p className="mt-1 text-sm">
                                {format(colaboracionSeleccionada.ultimaActividad, 'dd/MM HH:mm', { locale: es })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="entregables" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Estado de Entregables</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {colaboracionSeleccionada.entregables.map((entregable, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {entregable.tipo === 'imagen' && <Image className="w-5 h-5 text-blue-500" />}
                                    {entregable.tipo === 'video' && <Video className="w-5 h-5 text-purple-500" />}
                                    {entregable.tipo === 'story' && <Camera className="w-5 h-5 text-pink-500" />}
                                    {entregable.tipo === 'post' && <FileText className="w-5 h-5 text-green-500" />}
                                    <span className="font-medium capitalize">{entregable.tipo}s</span>
                                  </div>
                                  <span className="text-sm">
                                    {entregable.completados} de {entregable.cantidad} completados
                                  </span>
                                </div>
                                <Progress 
                                  value={(entregable.completados / entregable.cantidad) * 100} 
                                  className="h-2"
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="metricas" className="space-y-4">
                      {colaboracionSeleccionada.metricas ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Alcance</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {colaboracionSeleccionada.metricas.alcance.toLocaleString('es-MX')}
                              </p>
                              <p className="text-sm text-gray-500">personas alcanzadas</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Engagement</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {colaboracionSeleccionada.metricas.engagement}%
                              </p>
                              <p className="text-sm text-gray-500">tasa de interacción</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Clicks</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {colaboracionSeleccionada.metricas.clicks.toLocaleString('es-MX')}
                              </p>
                              <p className="text-sm text-gray-500">clicks en enlaces</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Conversiones</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {colaboracionSeleccionada.metricas.conversiones}
                              </p>
                              <p className="text-sm text-gray-500">ventas generadas</p>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Las métricas estarán disponibles cuando se complete la colaboración</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="comunicacion" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>Historial de Mensajes</span>
                            <Badge variant="secondary">{colaboracionSeleccionada.mensajesCount} mensajes</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Acceso al historial completo de comunicación</p>
                            <Button variant="outline" className="mt-4">
                              Ver Conversación
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="finanzas" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Desglose Financiero</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600">Presupuesto Total</span>
                              <span className="font-medium">${colaboracionSeleccionada.presupuesto.toLocaleString('es-MX')} MXN</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600">Comisión Plataforma (15%)</span>
                              <span className="text-purple-600">-${colaboracionSeleccionada.comision.toLocaleString('es-MX')} MXN</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center py-2">
                              <span className="font-medium">Pago al Creador</span>
                              <span className="font-bold text-lg">
                                ${(colaboracionSeleccionada.presupuesto - colaboracionSeleccionada.comision).toLocaleString('es-MX')} MXN
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {colaboracionSeleccionada.estado === 'completada' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Calificaciones</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Calificación del Creador</Label>
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-4 h-4 ${
                                          i < (colaboracionSeleccionada.calificacionCreador || 0) 
                                            ? 'text-yellow-500 fill-current' 
                                            : 'text-gray-300'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Calificación del Negocio</Label>
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-4 h-4 ${
                                          i < (colaboracionSeleccionada.calificacionNegocio || 0) 
                                            ? 'text-yellow-500 fill-current' 
                                            : 'text-gray-300'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {modalAccion === 'moderar' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Contenido para Moderar</CardTitle>
                        <CardDescription>Revisa y aprueba el contenido de la colaboración</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500 mb-4">
                            Sistema de moderación de contenido en tiempo real
                          </p>
                          <div className="flex items-center justify-center space-x-3">
                            <Button variant="outline" className="text-green-600">
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Aprobar Todo
                            </Button>
                            <Button variant="outline" className="text-red-600">
                              <ThumbsDown className="w-4 h-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {modalAccion === 'disputa' && (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900">Disputa Activa</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Esta colaboración tiene {colaboracionSeleccionada.reportes} reportes y requiere intervención administrativa.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Detalles de la Disputa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Motivo de la Disputa</Label>
                            <Textarea 
                              placeholder="Describe el motivo de la disputa..."
                              rows={4}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Evidencias</Label>
                            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                Arrastra archivos aquí o haz clic para subir evidencias
                              </p>
                            </div>
                          </div>
                          <div>
                            <Label>Resolución Propuesta</Label>
                            <Select>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Seleccionar resolución" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="favor_creador">A favor del creador</SelectItem>
                                <SelectItem value="favor_negocio">A favor del negocio</SelectItem>
                                <SelectItem value="parcial">Resolución parcial</SelectItem>
                                <SelectItem value="cancelar">Cancelar colaboración</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setModalAbierto(false)}>
                        Cancelar
                      </Button>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Resolver Disputa
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};